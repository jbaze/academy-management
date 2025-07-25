import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Student } from '../models/student';
import { Course } from '../../courses/models/course';
import { Mentor } from '../../mentors/models/mentor';
import { User } from '../../../core/models/user';
import { StudentService } from '../services/student';
import { CourseService } from '../../courses/services/course';
import { MentorService } from '../../mentors/services/mentor';
import { UserService } from '../../../core/services/user';
import { Auth} from '../../../core/services/auth';
import { NotificationService } from '../../../core/services/notification';
import { UserRole } from '../../../core/models/role';

interface EnrollmentCourse {
  course: Course;
  mentor: User | null;
  isEnrolled: boolean;
  canEnroll: boolean;
  conflictReason?: string;
}

@Component({
  selector: 'app-student-enrollment',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './student-enrollment.html',
  styleUrl: './student-enrollment.scss'
})
export class StudentEnrollment implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private studentService = inject(StudentService);
  private courseService = inject(CourseService);
  private mentorService = inject(MentorService);
  private userService = inject(UserService);
  private authService = inject(Auth);
  private notificationService = inject(NotificationService);

  student = signal<Student | null>(null);
  availableCourses = signal<EnrollmentCourse[]>([]);
  enrolledCourses = signal<EnrollmentCourse[]>([]);
  loading = signal(false);
  searchControl = new FormControl('');
  selectedCategory = new FormControl('all');
  selectedLevel = new FormControl('all');

  currentUser = computed(() => this.authService.getCurrentUser());
  canManageEnrollment = computed(() => {
    const user = this.currentUser();
    const student = this.student();
    return user?.role === UserRole.ADMIN ||
           (user?.role === UserRole.PARENT && student?.parentId === user.id);
  });

  filteredAvailableCourses = computed(() => {
    const searchTerm = this.searchControl.value?.toLowerCase() || '';
    const category = this.selectedCategory.value || 'all';
    const level = this.selectedLevel.value || 'all';

    return this.availableCourses().filter(enrollmentCourse => {
      const course = enrollmentCourse.course;
      const matchesSearch = course.name.toLowerCase().includes(searchTerm) ||
                           course.description.toLowerCase().includes(searchTerm) ||
                           course.category.toLowerCase().includes(searchTerm);

      const matchesCategory = category === 'all' || course.category === category;
      const matchesLevel = level === 'all' || course.level === level;

      return matchesSearch && matchesCategory && matchesLevel;
    });
  });

  categories = computed(() => {
    const allCourses = [...this.availableCourses(), ...this.enrolledCourses()];
    const categories = new Set(allCourses.map(ec => ec.course.category));
    return Array.from(categories).sort();
  });

  levels = computed(() => {
    const allCourses = [...this.availableCourses(), ...this.enrolledCourses()];
    const levels = new Set(allCourses.map(ec => ec.course.level));
    return Array.from(levels).sort();
  });

  ngOnInit(): void {
    const studentId = this.route.snapshot.paramMap.get('id');
    if (studentId) {
      this.loadStudentAndCourses(studentId);
    }
  }

  private loadStudentAndCourses(studentId: string): void {
    this.loading.set(true);

    this.studentService.getStudentById(studentId).subscribe({
      next: (student) => {
        if (student) {
          this.student.set(student);
          this.loadCoursesData(student);
        } else {
          this.notificationService.showError('Student not found');
          this.router.navigate(['/students']);
        }
      },
      error: () => {
        this.notificationService.showError('Failed to load student');
        this.loading.set(false);
      }
    });
  }

  private loadCoursesData(student: Student): void {
    this.courseService.getCourses().subscribe({
      next: (courses) => {
        this.processCoursesData(courses, student);
        this.loading.set(false);
      },
      error: () => {
        this.notificationService.showError('Failed to load courses');
        this.loading.set(false);
      }
    });
  }

  private async processCoursesData(courses: Course[], student: Student): Promise<void> {
    const mentors = await this.loadMentors();
    const mentorUsers = await this.loadMentorUsers(mentors);

    const enrolledCourses: EnrollmentCourse[] = [];
    const availableCourses: EnrollmentCourse[] = [];

    for (const course of courses) {
      const mentor = mentors.find(m => m.id === course.mentorId);
      const mentorUser = mentor ? mentorUsers[mentor.userId] : null;

      const enrollmentCourse: EnrollmentCourse = {
        course,
        mentor: mentorUser,
        isEnrolled: student.enrolledCourses.includes(course.id),
        canEnroll: this.canEnrollInCourse(course, student),
        conflictReason: this.getEnrollmentConflict(course, student)
      };

      if (enrollmentCourse.isEnrolled) {
        enrolledCourses.push(enrollmentCourse);
      } else {
        availableCourses.push(enrollmentCourse);
      }
    }

    this.enrolledCourses.set(enrolledCourses);
    this.availableCourses.set(availableCourses);
  }

  private loadMentors(): Promise<Mentor[]> {
    return new Promise((resolve, reject) => {
      this.mentorService.getMentors().subscribe({
        next: (mentors) => resolve(mentors),
        error: (error) => reject(error)
      });
    });
  }

  private loadMentorUsers(mentors: Mentor[]): Promise<{ [key: string]: User }> {
    return new Promise((resolve) => {
      const mentorUsers: { [key: string]: User } = {};
      let loadedCount = 0;

      if (mentors.length === 0) {
        resolve(mentorUsers);
        return;
      }

      mentors.forEach(mentor => {
        this.userService.getUserById(mentor.userId).subscribe({
          next: (user) => {
            if (user) {
              mentorUsers[mentor.userId] = user;
            }
            loadedCount++;
            if (loadedCount === mentors.length) {
              resolve(mentorUsers);
            }
          },
          error: () => {
            loadedCount++;
            if (loadedCount === mentors.length) {
              resolve(mentorUsers);
            }
          }
        });
      });
    });
  }

  private canEnrollInCourse(course: Course, student: Student): boolean {
    // Check if course is active
    if (course.status !== 'active') return false;

    // Check if course has available spots
    if (course.currentStudents >= course.maxStudents) return false;

    // Check if student is already enrolled
    if (student.enrolledCourses.includes(course.id)) return false;

    // Check for schedule conflicts
    return !this.hasScheduleConflict(course, student);
  }

  private getEnrollmentConflict(course: Course, student: Student): string | undefined {
    if (course.status !== 'active') return 'Course is not active';
    if (course.currentStudents >= course.maxStudents) return 'Course is full';
    if (student.enrolledCourses.includes(course.id)) return 'Already enrolled';
    if (this.hasScheduleConflict(course, student)) return 'Schedule conflict';
    return undefined;
  }

  private hasScheduleConflict(course: Course, student: Student): boolean {
    // Get all enrolled courses for the student
    const enrolledCourses = this.enrolledCourses().map(ec => ec.course);

    // Check for time conflicts
    for (const enrolledCourse of enrolledCourses) {
      for (const newSchedule of course.schedule) {
        for (const existingSchedule of enrolledCourse.schedule) {
          if (this.timeSlotsOverlap(newSchedule, existingSchedule)) {
            return true;
          }
        }
      }
    }

    return false;
  }

  private timeSlotsOverlap(slot1: any, slot2: any): boolean {
    if (slot1.dayOfWeek !== slot2.dayOfWeek) return false;

    const start1 = this.timeToMinutes(slot1.startTime);
    const end1 = this.timeToMinutes(slot1.endTime);
    const start2 = this.timeToMinutes(slot2.startTime);
    const end2 = this.timeToMinutes(slot2.endTime);

    return start1 < end2 && start2 < end1;
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  enrollInCourse(enrollmentCourse: EnrollmentCourse): void {
    if (!this.canManageEnrollment()) {
      this.notificationService.showError('You do not have permission to manage enrollments');
      return;
    }

    const student = this.student();
    if (!student || !enrollmentCourse.canEnroll) return;

    this.loading.set(true);

    this.studentService.enrollStudentInCourse(student.id, enrollmentCourse.course.id).subscribe({
      next: (updatedStudent) => {
        this.student.set(updatedStudent);
        this.notificationService.showSuccess(`Successfully enrolled in ${enrollmentCourse.course.name}`);
        this.refreshEnrollmentData();
      },
      error: () => {
        this.notificationService.showError('Failed to enroll in course');
        this.loading.set(false);
      }
    });
  }

  unenrollFromCourse(enrollmentCourse: EnrollmentCourse): void {
    if (!this.canManageEnrollment()) {
      this.notificationService.showError('You do not have permission to manage enrollments');
      return;
    }

    const student = this.student();
    if (!student) return;

    if (confirm(`Are you sure you want to unenroll from ${enrollmentCourse.course.name}?`)) {
      this.loading.set(true);

      this.studentService.unenrollStudentFromCourse(student.id, enrollmentCourse.course.id).subscribe({
        next: (updatedStudent) => {
          this.student.set(updatedStudent);
          this.notificationService.showSuccess(`Successfully unenrolled from ${enrollmentCourse.course.name}`);
          this.refreshEnrollmentData();
        },
        error: () => {
          this.notificationService.showError('Failed to unenroll from course');
          this.loading.set(false);
        }
      });
    }
  }

  private refreshEnrollmentData(): void {
    const student = this.student();
    if (student) {
      this.loadCoursesData(student);
    }
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'active':
        return 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800';
      case 'inactive':
        return 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800';
      case 'suspended':
        return 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800';
      default:
        return 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800';
    }
  }

  getLevelBadgeClass(level: string): string {
    switch (level) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  formatTime(time: string): string {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  }

  formatSchedule(schedule: any[]): string {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return schedule.map(s =>
      `${days[s.dayOfWeek]} ${this.formatTime(s.startTime)}-${this.formatTime(s.endTime)}`
    ).join(', ');
  }

  calculateCourseDuration(course: Course): string {
    const weeks = course.duration;
    if (weeks < 4) return `${weeks} weeks`;
    if (weeks < 52) return `${Math.round(weeks / 4)} months`;
    return `${Math.round(weeks / 52)} years`;
  }

  trackByCourseId(index: number, enrollmentCourse: EnrollmentCourse): string {
    return enrollmentCourse.course.id;
  }

  clearFilters(): void {
    this.searchControl.setValue('');
    this.selectedCategory.setValue('all');
    this.selectedLevel.setValue('all');
  }
}
