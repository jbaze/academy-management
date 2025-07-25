import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { Student } from '../models/student';
import { StudentService } from '../services/student';
import { UserService } from '../../../core/services/user';
import { CourseService } from '../../courses/services/course';
import { Auth } from '../../../core/services/auth';
import { NotificationService } from '../../../core/services/notification';
import { User } from '../../../core/models/user';
import { Course } from '../../courses/models/course';
import { UserRole } from '../../../core/models/role';

@Component({
  selector: 'app-student-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './student-detail.html',
  styleUrl: './student-detail.scss'
})
export class StudentDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private studentService = inject(StudentService);
  private userService = inject(UserService);
  private courseService = inject(CourseService);
  private authService = inject(Auth);
  private notificationService = inject(NotificationService);

  student = signal<Student | null>(null);
  parent = signal<User | null>(null);
  enrolledCourses = signal<Course[]>([]);
  loading = signal(false);

  currentUser = computed(() => this.authService.getCurrentUser());
  canEdit = computed(() => {
    const user = this.currentUser();
    return user?.role === UserRole.ADMIN ||
           (user?.role === UserRole.PARENT && user.id === this.student()?.parentId);
  });

  ngOnInit(): void {
    const studentId = this.route.snapshot.paramMap.get('id');
    if (studentId) {
      this.loadStudent(studentId);
    }
  }

  private loadStudent(id: string): void {
    this.loading.set(true);

    this.studentService.getStudentById(id).subscribe({
      next: (student) => {
        if (student) {
          this.student.set(student);
          this.loadParent(student.parentId);
          this.loadEnrolledCourses(student.enrolledCourses);
        }
        this.loading.set(false);
      },
      error: () => {
        this.notificationService.showError('Failed to load student');
        this.loading.set(false);
      }
    });
  }

  private loadParent(parentId: string): void {
    this.userService.getUserById(parentId).subscribe({
      next: (parent) => {
        if (parent) {
          this.parent.set(parent);
        }
      },
      error: () => {
        console.error('Failed to load parent information');
      }
    });
  }

  private loadEnrolledCourses(courseIds: string[]): void {
    if (courseIds.length === 0) {
      this.enrolledCourses.set([]);
      return;
    }

    this.courseService.getCourses().subscribe({
      next: (allCourses) => {
        const enrolled = allCourses.filter(course => courseIds.includes(course.id));
        this.enrolledCourses.set(enrolled);
      },
      error: () => {
        console.error('Failed to load enrolled courses');
      }
    });
  }

  getAge(): number {
    const student = this.student();
    if (!student) return 0;

    const today = new Date();
    const birthDate = new Date(student.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  }

  getStatusBadgeClass(isActive: boolean): string {
    return isActive
      ? 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800'
      : 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800';
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getCourseLevelClass(level: string): string {
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

  getCourseStatusClass(status: string): string {
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
}
