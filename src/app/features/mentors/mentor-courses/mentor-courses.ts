import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { MentorService } from '../services/mentor';
import { CourseService } from '../../courses/services/course';
import { NotificationService } from '../../../core/services/notification';
import { Auth} from '../../../core/services/auth';

import { Mentor } from '../models/mentor';
import { Course } from '../../courses/models/course';
import { User} from '../../../core/models/user';
import { UserRole } from '../../../core/models/role';

@Component({
  selector: 'app-mentor-courses',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './mentor-courses.html',
  styleUrl: './mentor-courses.scss'
})
export class MentorCourses implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private formBuilder = inject(FormBuilder);
  private mentorService = inject(MentorService);
  private courseService = inject(CourseService);
  private notificationService = inject(NotificationService);
  private authService = inject(Auth);

  // Signals
  mentorId = signal<string | null>(null);
  mentor = signal<Mentor | null>(null);
  assignedCourses = signal<Course[]>([]);
  availableCourses = signal<Course[]>([]);
  isLoading = signal(false);
  isAssigning = signal(false);
  selectedCourseId = signal<string | null>(null);

  // Form
  assignCourseForm: FormGroup;

  // Computed
  currentUser = computed(() => this.authService.getCurrentUser());
  isAdmin = computed(() => this.currentUser()?.role === UserRole.ADMIN);
  canManageCourses = computed(() => {
    const user = this.currentUser();
    return user?.role === UserRole.ADMIN ||
           (user?.role === UserRole.MENTOR && this.mentor()?.userId === user.id);
  });

  constructor() {
    this.assignCourseForm = this.formBuilder.group({
      courseId: ['']
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.mentorId.set(id);
      this.loadMentorData();
    } else {
      // If no ID, try to get current mentor's data
      const user = this.currentUser();
      if (user?.role === UserRole.MENTOR) {
        this.loadCurrentMentorData();
      } else {
        this.notificationService.showError('Mentor ID is required');
        this.router.navigate(['/mentors']);
      }
    }
  }

  private loadCurrentMentorData(): void {
    const user = this.currentUser();
    if (user) {
      this.mentorService.getMentorByUserId(user.id).subscribe({
        next: (mentor) => {
          if (mentor) {
            this.mentorId.set(mentor.id);
            this.mentor.set(mentor);
            this.loadCourses();
          } else {
            this.notificationService.showError('Mentor profile not found');
            this.router.navigate(['/dashboard']);
          }
        },
        error: () => {
          this.notificationService.showError('Failed to load mentor data');
        }
      });
    }
  }

  private loadMentorData(): void {
    this.isLoading.set(true);
    const id = this.mentorId();

    if (id) {
      this.mentorService.getMentorById(id).subscribe({
        next: (mentor) => {
          if (mentor) {
            this.mentor.set(mentor);
            this.loadCourses();
          } else {
            this.notificationService.showError('Mentor not found');
            this.router.navigate(['/mentors']);
          }
        },
        error: () => {
          this.notificationService.showError('Failed to load mentor');
          this.isLoading.set(false);
        }
      });
    }
  }

  private loadCourses(): void {
    const mentor = this.mentor();
    if (!mentor) return;

    // Load all courses
    this.courseService.getCourses().subscribe({
      next: (allCourses) => {
        // Filter assigned and available courses
        const assigned = allCourses.filter(course =>
          mentor.assignedCourses.includes(course.id)
        );
        const available = allCourses.filter(course =>
          !mentor.assignedCourses.includes(course.id) &&
          (course.status === 'active' || course.status === 'inactive')
        );

        this.assignedCourses.set(assigned);
        this.availableCourses.set(available);
        this.isLoading.set(false);
      },
      error: () => {
        this.notificationService.showError('Failed to load courses');
        this.isLoading.set(false);
      }
    });
  }

  onAssignCourse(): void {
    const courseId = this.assignCourseForm.get('courseId')?.value;
    if (!courseId) {
      this.notificationService.showWarning('Please select a course to assign');
      return;
    }

    this.isAssigning.set(true);
    const mentorId = this.mentorId();

    if (mentorId) {
      this.mentorService.assignCourse(mentorId, courseId).subscribe({
        next: () => {
          this.notificationService.showSuccess('Course assigned successfully');
          this.assignCourseForm.reset();
          this.loadMentorData(); // Reload to get updated data
        },
        error: () => {
          this.notificationService.showError('Failed to assign course');
          this.isAssigning.set(false);
        }
      });
    }
  }

  onUnassignCourse(courseId: string): void {
    if (confirm('Are you sure you want to unassign this course?')) {
      const mentorId = this.mentorId();

      if (mentorId) {
        this.mentorService.unassignCourse(mentorId, courseId).subscribe({
          next: () => {
            this.notificationService.showSuccess('Course unassigned successfully');
            this.loadMentorData(); // Reload to get updated data
          },
          error: () => {
            this.notificationService.showError('Failed to unassign course');
          }
        });
      }
    }
  }

  onViewCourse(courseId: string): void {
    this.router.navigate(['/courses', courseId]);
  }

  onEditCourse(courseId: string): void {
    this.router.navigate(['/courses', courseId, 'edit']);
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getLevelClass(level: string): string {
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

  formatSchedule(schedule: { dayOfWeek: number; startTime: string; endTime: string }[]): string {
    const daysMap = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return schedule.map(s =>
      `${daysMap[s.dayOfWeek]} ${s.startTime}-${s.endTime}`
    ).join(', ');
  }

  goBack(): void {
    if (this.isAdmin()) {
      this.router.navigate(['/mentors', this.mentorId()]);
    } else {
      this.router.navigate(['/dashboard']);
    }
  }

  getActiveCourses(): number {
    return this.assignedCourses().filter(course => course.status === 'active').length;
  }

  getTotalStudents(): number {
    return this.assignedCourses().reduce((total, course) => total + (course.currentStudents || 0), 0);
  }

  trackByCourseId(index: number, course: any): any {
    return course.id;
  }
}
