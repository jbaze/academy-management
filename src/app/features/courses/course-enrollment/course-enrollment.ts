import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Course } from '../models/course';
import { Student } from '../../students/models/student';
import { CourseService } from '../services/course';
import { StudentService } from '../../students/services/student';
import { FakeApi } from '../../../core/api/fake-api';
import { NotificationService } from '../../../core/services/notification';
import { Auth } from '../../../core/services/auth';
import { UserRole } from '../../../core/models/role';

@Component({
  selector: 'app-course-enrollment',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './course-enrollment.html',
  styleUrl: './course-enrollment.scss'
})
export class CourseEnrollment implements OnInit {
  private route = inject(ActivatedRoute);
  private courseService = inject(CourseService);
  private studentService = inject(StudentService);
  private fakeApiService = inject(FakeApi);
  private notificationService = inject(NotificationService);
  private authService = inject(Auth);

  course = signal<Course | null>(null);
  enrolledStudents = signal<Student[]>([]);
  availableStudents = signal<Student[]>([]);
  loading = signal(false);

  searchControl = new FormControl('');

  currentUser = computed(() => this.authService.getCurrentUser());
  isAdmin = computed(() => this.currentUser()?.role === UserRole.ADMIN);

  filteredAvailableStudents = computed(() => {
    const searchTerm = this.searchControl.value?.toLowerCase() || '';
    return this.availableStudents().filter(student =>
      student.firstName.toLowerCase().includes(searchTerm) ||
      student.lastName.toLowerCase().includes(searchTerm) ||
      student.academicLevel.toLowerCase().includes(searchTerm)
    );
  });

  ngOnInit(): void {
    const courseId = this.route.snapshot.paramMap.get('id');
    if (courseId) {
      this.loadCourseData(courseId);
    }
  }

  private loadCourseData(courseId: string): void {
    this.loading.set(true);

    this.courseService.getCourseById(courseId).subscribe({
      next: (course) => {
        if (course) {
          this.course.set(course);
          this.loadEnrolledStudents(course.enrolledStudents);
          this.loadAvailableStudents(course.enrolledStudents);
        }
        this.loading.set(false);
      },
      error: () => {
        this.notificationService.showError('Failed to load course');
        this.loading.set(false);
      }
    });
  }

  private loadEnrolledStudents(enrolledIds: string[]): void {
    if (enrolledIds.length === 0) {
      this.enrolledStudents.set([]);
      return;
    }

    this.studentService.getStudents().subscribe({
      next: (allStudents) => {
        const enrolled = allStudents.filter(s => enrolledIds.includes(s.id) && s.isActive);
        this.enrolledStudents.set(enrolled);
      }
    });
  }

  private loadAvailableStudents(enrolledIds: string[]): void {
    this.studentService.getStudents().subscribe({
      next: (allStudents) => {
        const available = allStudents.filter(s =>
          !enrolledIds.includes(s.id) && s.isActive
        );
        this.availableStudents.set(available);
      }
    });
  }

  enrollStudent(student: Student): void {
    const course = this.course();
    if (!course) return;

    if (course.currentStudents >= course.maxStudents) {
      this.notificationService.showError('Course is at maximum capacity');
      return;
    }

    this.fakeApiService.enrollStudentInCourse(student.id, course.id).subscribe({
      next: () => {
        this.notificationService.showSuccess(`${student.firstName} ${student.lastName} enrolled successfully`);
        this.loadCourseData(course.id);
      },
      error: (error) => {
        this.notificationService.showError(error.message || 'Failed to enroll student');
      }
    });
  }

  unenrollStudent(student: Student): void {
    const course = this.course();
    if (!course) return;

    if (confirm(`Are you sure you want to unenroll ${student.firstName} ${student.lastName} from this course?`)) {
      this.fakeApiService.unenrollStudentFromCourse(student.id, course.id).subscribe({
        next: () => {
          this.notificationService.showSuccess(`${student.firstName} ${student.lastName} unenrolled successfully`);
          this.loadCourseData(course.id);
        },
        error: (error) => {
          this.notificationService.showError(error.message || 'Failed to unenroll student');
        }
      });
    }
  }

  getAge(dateOfBirth: Date): number {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  }

  getEnrollmentRate(): number {
    const course = this.course();
    return course && course.maxStudents > 0
      ? Math.round((course.currentStudents / course.maxStudents) * 100)
      : 0;
  }
}
