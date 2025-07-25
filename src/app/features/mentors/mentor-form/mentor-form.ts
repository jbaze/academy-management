import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Mentor } from '../models/mentor';
import { MentorService } from '../services/mentor';
import { UserService } from '../../../core/services/user';
import { NotificationService } from '../../../core/services/notification';
import { User} from '../../../core/models/user';
import { UserRole } from '../../../core/models/role';

@Component({
  selector: 'app-mentor-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './mentor-form.html',
  styleUrl: './mentor-form.scss'
})
export class MentorForm implements OnInit {
  private formBuilder = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private mentorService = inject(MentorService);
  private userService = inject(UserService);
  private notificationService = inject(NotificationService);

  mentorForm: FormGroup;
  mentorId = signal<string | null>(null);
  isEditing = signal(false);
  isLoading = signal(false);
  mentorUsers = signal<User[]>([]);

  daysOfWeek = [
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' },
    { value: 0, label: 'Sunday' }
  ];

  subjectOptions = [
    'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science',
    'English', 'History', 'Geography', 'Art', 'Music', 'Languages'
  ];

  constructor() {
    this.mentorForm = this.formBuilder.group({
      userId: ['', [Validators.required]],
      specialization: this.formBuilder.array([]),
      experience: [0, [Validators.required, Validators.min(0)]],
      qualifications: this.formBuilder.array([]),
      hourlyRate: [0, [Validators.required, Validators.min(0)]],
      bio: ['', [Validators.required, Validators.maxLength(500)]],
      availableHours: this.formBuilder.array([]),
      isActive: [true]
    });
  }

  ngOnInit(): void {
    this.loadMentorUsers();

    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.mentorId.set(id);
      this.isEditing.set(true);
      this.loadMentor(id);
    } else {
      // Add default values for new mentor
      this.addSpecialization();
      this.addQualification();
      this.addAvailableHour();
    }
  }

  private loadMentorUsers(): void {
    this.userService.getUsersByRole(UserRole.MENTOR).subscribe({
      next: (users) => {
        this.mentorUsers.set(users);
      },
      error: () => {
        this.notificationService.showError('Failed to load mentor users');
      }
    });
  }

  private loadMentor(id: string): void {
    this.isLoading.set(true);
    this.mentorService.getMentorById(id).subscribe({
      next: (mentor) => {
        if (mentor) {
          this.populateForm(mentor);
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.notificationService.showError('Failed to load mentor');
        this.isLoading.set(false);
      }
    });
  }

  private populateForm(mentor: Mentor): void {
    this.mentorForm.patchValue({
      userId: mentor.userId,
      experience: mentor.experience,
      hourlyRate: mentor.hourlyRate,
      bio: mentor.bio,
      isActive: mentor.isActive
    });

    // Clear and populate arrays
    this.clearFormArray('specialization');
    mentor.specialization.forEach(spec => {
      this.specializationArray.push(this.formBuilder.control(spec, Validators.required));
    });

    this.clearFormArray('qualifications');
    mentor.qualifications.forEach(qual => {
      this.qualificationsArray.push(this.formBuilder.control(qual, Validators.required));
    });

    this.clearFormArray('availableHours');
    mentor.availableHours.forEach(hour => {
      this.availableHoursArray.push(this.formBuilder.group({
        dayOfWeek: [hour.dayOfWeek, Validators.required],
        startTime: [hour.startTime, Validators.required],
        endTime: [hour.endTime, Validators.required]
      }));
    });
  }

  private clearFormArray(arrayName: string): void {
    const array = this.mentorForm.get(arrayName) as FormArray;
    while (array.length !== 0) {
      array.removeAt(0);
    }
  }

  // Form array getters
  get specializationArray(): FormArray {
    return this.mentorForm.get('specialization') as FormArray;
  }

  get qualificationsArray(): FormArray {
    return this.mentorForm.get('qualifications') as FormArray;
  }

  get availableHoursArray(): FormArray {
    return this.mentorForm.get('availableHours') as FormArray;
  }

  // Add/Remove methods
  addSpecialization(): void {
    this.specializationArray.push(this.formBuilder.control('', Validators.required));
  }

  removeSpecialization(index: number): void {
    this.specializationArray.removeAt(index);
  }

  addQualification(): void {
    this.qualificationsArray.push(this.formBuilder.control('', Validators.required));
  }

  removeQualification(index: number): void {
    this.qualificationsArray.removeAt(index);
  }

  addAvailableHour(): void {
    this.availableHoursArray.push(this.formBuilder.group({
      dayOfWeek: ['', Validators.required],
      startTime: ['', Validators.required],
      endTime: ['', Validators.required]
    }));
  }

  removeAvailableHour(index: number): void {
    this.availableHoursArray.removeAt(index);
  }

  onSubmit(): void {
    if (this.mentorForm.valid) {
      this.isLoading.set(true);

      const formValue = this.mentorForm.getRawValue();
      const mentorData = {
        ...formValue,
        assignedCourses: []
      };

      const operation = this.isEditing()
        ? this.mentorService.updateMentor(this.mentorId()!, mentorData)
        : this.mentorService.createMentor(mentorData);

      operation.subscribe({
        next: () => {
          this.notificationService.showSuccess(
            `Mentor ${this.isEditing() ? 'updated' : 'created'} successfully`
          );
          this.router.navigate(['/mentors']);
        },
        error: () => {
          this.notificationService.showError(
            `Failed to ${this.isEditing() ? 'update' : 'create'} mentor`
          );
          this.isLoading.set(false);
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.mentorForm.controls).forEach(key => {
      this.mentorForm.get(key)?.markAsTouched();
    });
  }

  onCancel(): void {
    this.router.navigate(['/mentors']);
  }

  // Form getters
  get userId() { return this.mentorForm.get('userId'); }
  get experience() { return this.mentorForm.get('experience'); }
  get hourlyRate() { return this.mentorForm.get('hourlyRate'); }
  get bio() { return this.mentorForm.get('bio'); }
}
