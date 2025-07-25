import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Student } from '../models/student';
import { StudentService } from '../services/student';
import { Auth } from '../../../core/services/auth';
import { Loading } from '../../../core/services/loading';
import { NotificationService } from '../../../core/services/notification';
import { UserRole } from '../../../core/models/role';

@Component({
  selector: 'app-student-list',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './student-list.html',
  styleUrl: './student-list.scss'
})
export class StudentList implements OnInit {
  private studentService = inject(StudentService);
  private authService = inject(Auth);
  private loadingService = inject(Loading);
  private notificationService = inject(NotificationService);

  students = signal<Student[]>([]);
  loading = signal(false);
  searchControl = new FormControl('');

  currentUser = computed(() => this.authService.getCurrentUser());
  isAdmin = computed(() => this.currentUser()?.role === UserRole.ADMIN);
  isMentor = computed(() => this.currentUser()?.role === UserRole.MENTOR);
  isParent = computed(() => this.currentUser()?.role === UserRole.PARENT);

  filteredStudents = computed(() => {
    const searchTerm = this.searchControl.value?.toLowerCase() || '';
    return this.students().filter(student =>
      student.firstName.toLowerCase().includes(searchTerm) ||
      student.lastName.toLowerCase().includes(searchTerm) ||
      student.email?.toLowerCase().includes(searchTerm) ||
      student.academicLevel.toLowerCase().includes(searchTerm)
    );
  });

  ngOnInit(): void {
    this.loadStudents();
  }

  private loadStudents(): void {
    this.loading.set(true);

    const user = this.currentUser();
    if (!user) return;

    const studentsObservable = user.role === UserRole.PARENT
      ? this.studentService.getStudentsByParent(user.id)
      : this.studentService.getStudents();

    studentsObservable.subscribe({
      next: (students) => {
        this.students.set(students);
        this.loading.set(false);
      },
      error: (error) => {
        this.notificationService.showError('Failed to load students');
        this.loading.set(false);
      }
    });
  }

  deleteStudent(student: Student): void {
    if (confirm(`Are you sure you want to delete ${student.firstName} ${student.lastName}?`)) {
      this.studentService.deleteStudent(student.id).subscribe({
        next: () => {
          this.notificationService.showSuccess('Student deleted successfully');
          this.loadStudents();
        },
        error: () => {
          this.notificationService.showError('Failed to delete student');
        }
      });
    }
  }

  toggleStudentStatus(student: Student): void {
    const newStatus = !student.isActive;
    this.studentService.updateStudent(student.id, { isActive: newStatus }).subscribe({
      next: () => {
        this.notificationService.showSuccess(
          `Student ${newStatus ? 'activated' : 'deactivated'} successfully`
        );
        this.loadStudents();
      },
      error: () => {
        this.notificationService.showError('Failed to update student status');
      }
    });
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

  getStatusBadgeClass(isActive: boolean): string {
    return isActive
      ? 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800'
      : 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800';
  }

  trackByStudentId(index: number, student: Student): string {
    return student.id;
  }

}
