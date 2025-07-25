import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ScheduleService } from '../services/schedule';
import { Schedule } from '../models/schedule';
import { Course } from '../../courses/models/course';
import { Mentor } from '../../mentors/models/mentor';
import { Classroom } from '../../classrooms/models/classroom';
import { User } from '../../../core/models/user';
import { NotificationService } from '../../../core/services/notification';
import { FakeApi } from '../../../core/api/fake-api';
import { forkJoin } from 'rxjs';

interface MentorWithUser extends Mentor {
  user?: User;
}

@Component({
  selector: 'app-schedule-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './schedule-form.html',
  styleUrl: './schedule-form.scss'
})
export class ScheduleForm implements OnInit {
  private formBuilder = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private scheduleService = inject(ScheduleService);
  private notificationService = inject(NotificationService);
  private fakeApiService = inject(FakeApi);

  scheduleForm: FormGroup;
  scheduleId = signal<string | null>(null);
  isEditing = signal(false);
  isLoading = signal(false);

  courses = signal<Course[]>([]);
  mentors = signal<MentorWithUser[]>([]);
  classrooms = signal<Classroom[]>([]);
  users = signal<User[]>([]);

  daysOfWeek = [
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' },
    { value: 0, label: 'Sunday' }
  ];

  constructor() {
    this.scheduleForm = this.formBuilder.group({
      courseId: ['', [Validators.required]],
      mentorId: ['', [Validators.required]],
      classroomId: ['', [Validators.required]],
      dayOfWeek: ['', [Validators.required]],
      startTime: ['', [Validators.required]],
      endTime: ['', [Validators.required]],
      startDate: ['', [Validators.required]],
      endDate: ['', [Validators.required]],
      isRecurring: [true],
      isActive: [true]
    });
  }

  ngOnInit(): void {
    this.loadFormData();

    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.scheduleId.set(id);
      this.isEditing.set(true);
      this.loadSchedule(id);
    } else {
      // Set default dates
      const today = new Date();
      const endDate = new Date(today);
      endDate.setMonth(endDate.getMonth() + 6);

      this.scheduleForm.patchValue({
        startDate: today.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0]
      });
    }
  }

  private loadFormData(): void {
    this.isLoading.set(true);

    // Load all data in parallel
    forkJoin({
      courses: this.fakeApiService.getCourses(),
      mentors: this.fakeApiService.getMentors(),
      classrooms: this.fakeApiService.getClassrooms(),
      users: this.fakeApiService.getUsers()
    }).subscribe({
      next: (data) => {
        this.courses.set(data.courses);
        this.classrooms.set(data.classrooms);
        this.users.set(data.users);

        // Combine mentors with their user data
        const mentorsWithUsers = data.mentors.map(mentor => ({
          ...mentor,
          user: data.users.find(user => user.id === mentor.userId)
        }));

        this.mentors.set(mentorsWithUsers);
        this.isLoading.set(false);
      },
      error: () => {
        this.notificationService.showError('Failed to load form data');
        this.isLoading.set(false);
      }
    });
  }

  private loadSchedule(id: string): void {
    this.scheduleService.getScheduleById(id).subscribe({
      next: (schedule) => {
        if (schedule) {
          this.populateForm(schedule);
        }
      },
      error: () => {
        this.notificationService.showError('Failed to load schedule');
      }
    });
  }

  private populateForm(schedule: Schedule): void {
    this.scheduleForm.patchValue({
      courseId: schedule.courseId,
      mentorId: schedule.mentorId,
      classroomId: schedule.classroomId,
      dayOfWeek: schedule.dayOfWeek,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      startDate: schedule.startDate.toISOString().split('T')[0],
      endDate: schedule.endDate.toISOString().split('T')[0],
      isRecurring: schedule.isRecurring,
      isActive: schedule.isActive
    });
  }

  getMentorDisplayName(mentor: MentorWithUser): string {
    if (mentor.user) {
      return `${mentor.user.firstName} ${mentor.user.lastName}`;
    }
    return `Mentor ${mentor.id}`;
  }

  onSubmit(): void {
    if (this.scheduleForm.valid) {
      this.isLoading.set(true);

      const formValue = this.scheduleForm.getRawValue();

      // Get selected course, mentor, and classroom details
      const selectedCourse = this.courses().find(c => c.id === formValue.courseId);
      const selectedMentor = this.mentors().find(m => m.id === formValue.mentorId);
      const selectedClassroom = this.classrooms().find(c => c.id === formValue.classroomId);

      const scheduleData: Omit<Schedule, 'id' | 'createdAt' | 'updatedAt'> = {
        courseId: formValue.courseId,
        courseName: selectedCourse?.name || '',
        mentorId: formValue.mentorId,
        mentorName: selectedMentor ? this.getMentorDisplayName(selectedMentor) : '',
        classroomId: formValue.classroomId,
        classroomName: selectedClassroom?.name || '',
        dayOfWeek: parseInt(formValue.dayOfWeek),
        startTime: formValue.startTime,
        endTime: formValue.endTime,
        startDate: new Date(formValue.startDate),
        endDate: new Date(formValue.endDate),
        isRecurring: formValue.isRecurring,
        isActive: formValue.isActive,
        recurrencePattern: formValue.isRecurring ? {
          type: 'weekly',
          interval: 1,
          daysOfWeek: [parseInt(formValue.dayOfWeek)],
          endType: 'date',
          endDate: new Date(formValue.endDate)
        } : undefined
      };

      const operation = this.isEditing()
        ? this.scheduleService.updateSchedule(this.scheduleId()!, scheduleData)
        : this.scheduleService.createSchedule(scheduleData);

      operation.subscribe({
        next: () => {
          this.notificationService.showSuccess(
            `Schedule ${this.isEditing() ? 'updated' : 'created'} successfully`
          );
          this.router.navigate(['/scheduling']);
        },
        error: () => {
          this.notificationService.showError(
            `Failed to ${this.isEditing() ? 'update' : 'create'} schedule`
          );
          this.isLoading.set(false);
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.scheduleForm.controls).forEach(key => {
      this.scheduleForm.get(key)?.markAsTouched();
    });
  }

  onCancel(): void {
    this.router.navigate(['/scheduling']);
  }

  // Form getters
  get courseId() { return this.scheduleForm.get('courseId'); }
  get mentorId() { return this.scheduleForm.get('mentorId'); }
  get classroomId() { return this.scheduleForm.get('classroomId'); }
  get dayOfWeek() { return this.scheduleForm.get('dayOfWeek'); }
  get startTime() { return this.scheduleForm.get('startTime'); }
  get endTime() { return this.scheduleForm.get('endTime'); }
  get startDate() { return this.scheduleForm.get('startDate'); }
  get endDate() { return this.scheduleForm.get('endDate'); }
}
