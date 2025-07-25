import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Course } from '../models/course';
import { CourseService } from '../services/course';
import { MentorService } from '../../mentors/services/mentor';
import { ClassroomService } from '../../classrooms/services/classroom';
import { Auth } from '../../../core/services/auth';
import { NotificationService } from '../../../core/services/notification';
import { User } from '../../../core/models/user';
import { Mentor } from '../../mentors/models/mentor';
import { Classroom } from '../../classrooms/models/classroom';
import { UserRole } from '../../../core/models/role';

@Component({
  selector: 'app-course-list',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './course-list.html',
  styleUrl: './course-list.scss'
})
export class CourseList implements OnInit {
  private courseService = inject(CourseService);
  private mentorService = inject(MentorService);
  private classroomService = inject(ClassroomService);
  private authService = inject(Auth);
  private notificationService = inject(NotificationService);

  courses = signal<Course[]>([]);
  mentors = signal<{ [key: string]: Mentor }>({});
  classrooms = signal<{ [key: string]: Classroom }>({});
  loading = signal(false);

  searchControl = new FormControl('');
  statusFilter = new FormControl('all');
  levelFilter = new FormControl('all');
  categoryFilter = new FormControl('all');

  currentUser = computed(() => this.authService.getCurrentUser());
  isAdmin = computed(() => this.currentUser()?.role === UserRole.ADMIN);
  isMentor = computed(() => this.currentUser()?.role === UserRole.MENTOR);

  filteredCourses = computed(() => {
    const searchTerm = this.searchControl.value?.toLowerCase() || '';
    const status = this.statusFilter.value || 'all';
    const level = this.levelFilter.value || 'all';
    const category = this.categoryFilter.value || 'all';

    return this.courses().filter(course => {
      const matchesSearch = course.name.toLowerCase().includes(searchTerm) ||
                           course.description.toLowerCase().includes(searchTerm) ||
                           course.category.toLowerCase().includes(searchTerm);

      const matchesStatus = status === 'all' || course.status === status;
      const matchesLevel = level === 'all' || course.level === level;
      const matchesCategory = category === 'all' || course.category === category;

      return matchesSearch && matchesStatus && matchesLevel && matchesCategory;
    });
  });

  categories = computed(() => {
    const allCategories = this.courses().map(course => course.category);
    return [...new Set(allCategories)].sort();
  });

  ngOnInit(): void {
    this.loadCourses();
    this.loadMentors();
    this.loadClassrooms();
  }

  private loadCourses(): void {
    this.loading.set(true);

    const user = this.currentUser();
    if (!user) return;

    // If mentor, load only their courses
    const coursesObservable = user.role === UserRole.MENTOR
      ? this.courseService.getCoursesByMentor(user.id)
      : this.courseService.getCourses();

    coursesObservable.subscribe({
      next: (courses) => {
        this.courses.set(courses);
        this.loading.set(false);
      },
      error: () => {
        this.notificationService.showError('Failed to load courses');
        this.loading.set(false);
      }
    });
  }

  private loadMentors(): void {
    this.mentorService.getMentors().subscribe({
      next: (mentors) => {
        const mentorMap: { [key: string]: Mentor } = {};
        mentors.forEach(mentor => {
          mentorMap[mentor.id] = mentor;
        });
        this.mentors.set(mentorMap);
      }
    });
  }

  private loadClassrooms(): void {
    this.classroomService.getClassrooms().subscribe({
      next: (classrooms) => {
        const classroomMap: { [key: string]: Classroom } = {};
        classrooms.forEach(classroom => {
          classroomMap[classroom.id] = classroom;
        });
        this.classrooms.set(classroomMap);
      }
    });
  }

  deleteCourse(course: Course): void {
    if (confirm(`Are you sure you want to delete "${course.name}"? This will remove all student enrollments.`)) {
      this.courseService.deleteCourse(course.id).subscribe({
        next: () => {
          this.notificationService.showSuccess('Course deleted successfully');
          this.loadCourses();
        },
        error: () => {
          this.notificationService.showError('Failed to delete course');
        }
      });
    }
  }

  toggleCourseStatus(course: Course): void {
    const newStatus = course.status === 'active' ? 'inactive' : 'active';
    this.courseService.updateCourse(course.id, { status: newStatus }).subscribe({
      next: () => {
        this.notificationService.showSuccess(
          `Course ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`
        );
        this.loadCourses();
      },
      error: () => {
        this.notificationService.showError('Failed to update course status');
      }
    });
  }

  suspendCourse(course: Course): void {
    if (confirm(`Are you sure you want to suspend "${course.name}"?`)) {
      this.courseService.updateCourse(course.id, { status: 'suspended' }).subscribe({
        next: () => {
          this.notificationService.showSuccess('Course suspended successfully');
          this.loadCourses();
        },
        error: () => {
          this.notificationService.showError('Failed to suspend course');
        }
      });
    }
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'active':
        return 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800';
      case 'inactive':
        return 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800';
      case 'suspended':
        return 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800';
      default:
        return 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800';
    }
  }

  getLevelBadgeClass(level: string): string {
    switch (level) {
      case 'beginner':
        return 'bg-blue-100 text-blue-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getEnrollmentRate(course: Course): number {
    return course.maxStudents > 0 ? Math.round((course.currentStudents / course.maxStudents) * 100) : 0;
  }

  getEnrollmentColor(rate: number): string {
    if (rate >= 90) return 'text-red-600';
    if (rate >= 70) return 'text-yellow-600';
    return 'text-green-600';
  }

  formatSchedule(schedule: { dayOfWeek: number; startTime: string; endTime: string }[]): string {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return schedule.map(s => `${days[s.dayOfWeek]} ${s.startTime}-${s.endTime}`).join(', ');
  }

  trackByCourseId(index: number, course: Course): string {
    return course.id;
  }
}
