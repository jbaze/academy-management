import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Student } from '../models/student';
import { StudentService } from '../services/student';
import { UserService } from '../../../core/services/user';
import { Auth } from '../../../core/services/auth';
import { NotificationService } from '../../../core/services/notification';
import { User } from '../../../core/models/user';
import { UserRole } from '../../../core/models/role';

@Component({
  selector: 'app-student-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './student-form.html',
  styleUrl: './student-form.scss'
})
export class StudentForm implements OnInit {
  private formBuilder = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private studentService = inject(StudentService);
  private userService = inject(UserService);
  private authService = inject(Auth);
  private notificationService = inject(NotificationService);

  studentForm: FormGroup;
  studentId = signal<string | null>(null);
  isEditing = signal(false);
  isLoading = signal(false);
  parents = signal<User[]>([]);

  constructor() {
    this.studentForm = this.formBuilder.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      parentId: ['', [Validators.required]],
      dateOfBirth: ['', [Validators.required]],
      email: ['', [Validators.email]],
      phone: [''],
      address: ['', [Validators.required]],
      academicLevel: ['', [Validators.required]],
      emergencyContact: this.formBuilder.group({
        name: ['', [Validators.required]],
        phone: ['', [Validators.required]],
        relationship: ['', [Validators.required]]
      }),
      isActive: [true]
    });
  }

  ngOnInit(): void {
    this.loadParents();

    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.studentId.set(id);
      this.isEditing.set(true);
      this.loadStudent(id);
    }

    // If current user is parent, pre-select them
    const currentUser = this.authService.getCurrentUser();
    if (currentUser?.role === UserRole.PARENT) {
      this.studentForm.patchValue({ parentId: currentUser.id });
      this.studentForm.get('parentId')?.disable();
    }
  }

  private loadParents(): void {
    this.userService.getUsersByRole(UserRole.PARENT).subscribe({
      next: (parents) => {
        this.parents.set(parents);
      },
      error: () => {
        this.notificationService.showError('Failed to load parents');
      }
    });
  }

  private loadStudent(id: string): void {
    this.isLoading.set(true);
    this.studentService.getStudentById(id).subscribe({
      next: (student) => {
        if (student) {
          this.studentForm.patchValue({
            firstName: student.firstName,
            lastName: student.lastName,
            parentId: student.parentId,
            dateOfBirth: new Date(student.dateOfBirth).toISOString().split('T')[0],
            email: student.email,
            phone: student.phone,
            address: student.address,
            academicLevel: student.academicLevel,
            emergencyContact: student.emergencyContact,
            isActive: student.isActive
          });
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.notificationService.showError('Failed to load student');
        this.isLoading.set(false);
      }
    });
  }

  onSubmit(): void {
    if (this.studentForm.valid) {
      this.isLoading.set(true);

      const formValue = this.studentForm.getRawValue();
      const studentData = {
        ...formValue,
        dateOfBirth: new Date(formValue.dateOfBirth),
        enrolledCourses: []
      };

      const operation = this.isEditing()
        ? this.studentService.updateStudent(this.studentId()!, studentData)
        : this.studentService.createStudent(studentData);

      operation.subscribe({
        next: () => {
          this.notificationService.showSuccess(
            `Student ${this.isEditing() ? 'updated' : 'created'} successfully`
          );
          this.router.navigate(['/students']);
        },
        error: () => {
          this.notificationService.showError(
            `Failed to ${this.isEditing() ? 'update' : 'create'} student`
          );
          this.isLoading.set(false);
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.studentForm.controls).forEach(key => {
      this.studentForm.get(key)?.markAsTouched();
    });
  }

  onCancel(): void {
    this.router.navigate(['/students']);
  }

  // Form getters
  get firstName() { return this.studentForm.get('firstName'); }
  get lastName() { return this.studentForm.get('lastName'); }
  get parentId() { return this.studentForm.get('parentId'); }
  get dateOfBirth() { return this.studentForm.get('dateOfBirth'); }
  get email() { return this.studentForm.get('email'); }
  get phone() { return this.studentForm.get('phone'); }
  get address() { return this.studentForm.get('address'); }
  get academicLevel() { return this.studentForm.get('academicLevel'); }
  get emergencyContact() { return this.studentForm.get('emergencyContact'); }
}
