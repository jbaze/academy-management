import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { Course } from '../models/course';
import { Classroom } from '../../classrooms/models/classroom';
import { CourseService } from '../services/course';
import { ClassroomService } from '../../classrooms/services/classroom';
import { NotificationService } from '../../../core/services/notification';
import { Auth } from '../../../core/services/auth';
import { UserRole } from '../../../core/models/role';

@Component({
  selector: 'app-course-schedule',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './course-schedule.html',
  styleUrl: './course-schedule.scss'
})
export class CourseSchedule implements OnInit {
  private route = inject(ActivatedRoute);
  private formBuilder = inject(FormBuilder);
  private courseService = inject(CourseService);
  private classroomService = inject(ClassroomService);
  private notificationService = inject(NotificationService);
  private authService = inject(Auth);

  course = signal<Course | null>(null);
  classrooms = signal<Classroom[]>([]);
  scheduleForm: FormGroup;
  loading = signal(false);
  isEditing = signal(false);

  currentUser = computed(() => this.authService.getCurrentUser());
  canEdit = computed(() => {
    const user = this.currentUser();
    return user?.role === UserRole.ADMIN;
  });

  daysOfWeek = [
    { value: 0, label: 'Sunday', short: 'Sun' },
    { value: 1, label: 'Monday', short: 'Mon' },
    { value: 2, label: 'Tuesday', short: 'Tue' },
    { value: 3, label: 'Wednesday', short: 'Wed' },
    { value: 4, label: 'Thursday', short: 'Thu' },
    { value: 5, label: 'Friday', short: 'Fri' },
    { value: 6, label: 'Saturday', short: 'Sat' }
  ];

  // FIX: Add missing timeSlots property for calendar view
  timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00', '13:00',
    '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
  ];

  constructor() {
    this.scheduleForm = this.formBuilder.group({
      classroomId: ['', Validators.required],
      schedule: this.formBuilder.array([])
    });
  }

  ngOnInit(): void {
    const courseId = this.route.snapshot.paramMap.get('id');
    if (courseId) {
      this.loadCourse(courseId);
    }
    this.loadClassrooms();
  }

  private loadCourse(courseId: string): void {
    this.loading.set(true);

    this.courseService.getCourseById(courseId).subscribe({
      next: (course) => {
        if (course) {
          this.course.set(course);
          this.populateScheduleForm(course);
        }
        this.loading.set(false);
      },
      error: () => {
        this.notificationService.showError('Failed to load course');
        this.loading.set(false);
      }
    });
  }

  private loadClassrooms(): void {
    this.classroomService.getClassrooms().subscribe({
      next: (classrooms) => {
        this.classrooms.set(classrooms.filter(c => c.isActive));
      }
    });
  }

  private populateScheduleForm(course: Course): void {
    this.scheduleForm.patchValue({
      classroomId: course.classroomId
    });

    // Clear and populate schedule array
    this.clearScheduleArray();
    course.schedule.forEach(scheduleItem => {
      this.scheduleArray.push(this.formBuilder.group({
        dayOfWeek: [scheduleItem.dayOfWeek, Validators.required],
        startTime: [scheduleItem.startTime, Validators.required],
        endTime: [scheduleItem.endTime, Validators.required]
      }));
    });
  }

  get scheduleArray(): FormArray {
    return this.scheduleForm.get('schedule') as FormArray;
  }

  addScheduleSlot(): void {
    this.scheduleArray.push(this.formBuilder.group({
      dayOfWeek: ['', Validators.required],
      startTime: ['', Validators.required],
      endTime: ['', Validators.required]
    }));
  }

  removeScheduleSlot(index: number): void {
    this.scheduleArray.removeAt(index);
  }

  private clearScheduleArray(): void {
    while (this.scheduleArray.length !== 0) {
      this.scheduleArray.removeAt(0);
    }
  }

  toggleEdit(): void {
    this.isEditing.set(!this.isEditing());
    if (!this.isEditing()) {
      // Reset form if canceling
      const course = this.course();
      if (course) {
        this.populateScheduleForm(course);
      }
    }
  }

  onSubmit(): void {
    if (this.scheduleForm.valid) {
      const course = this.course();
      if (!course) return;

      this.loading.set(true);
      const formValue = this.scheduleForm.getRawValue();

      this.courseService.updateCourse(course.id, {
        classroomId: formValue.classroomId,
        schedule: formValue.schedule
      }).subscribe({
        next: () => {
          this.notificationService.showSuccess('Schedule updated successfully');
          this.isEditing.set(false);
          this.loadCourse(course.id);
        },
        error: () => {
          this.notificationService.showError('Failed to update schedule');
          this.loading.set(false);
        }
      });
    }
  }

  formatTime(time: string): string {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  }

  getDayLabel(dayOfWeek: number): string {
    return this.daysOfWeek.find(d => d.value === dayOfWeek)?.label || '';
  }

  checkTimeConflict(index: number): boolean {
    // This would check for scheduling conflicts with other courses
    // For now, just return false
    return false;
  }

  calculateDuration(startTime: string, endTime: string): string {
    const start = new Date(`1970-01-01T${startTime}`);
    const end = new Date(`1970-01-01T${endTime}`);
    const diffMs = end.getTime() - start.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffHours > 0) {
      return diffMinutes > 0 ? `${diffHours}h ${diffMinutes}m` : `${diffHours}h`;
    }
    return `${diffMinutes}m`;
  }

  isCurrentUserAdmin(): boolean {
    return this.authService.hasRole(UserRole.ADMIN);
  }

  isCurrentUserMentor(): boolean {
    return this.authService.hasRole(UserRole.MENTOR);
  }

  // FIX: Add missing getClassroomName method
  getClassroomName(): string {
    const course = this.course();
    if (!course?.classroomId) return 'No classroom assigned';

    const classroom = this.classrooms().find(c => c.id === course.classroomId);
    return classroom?.name || 'Unknown classroom';
  }

  // FIX: Add missing getClassroomLocation method
  getClassroomLocation(): string {
    const course = this.course();
    if (!course?.classroomId) return 'No location';

    const classroom = this.classrooms().find(c => c.id === course.classroomId);
    return classroom?.location || 'Unknown location';
  }

  // FIX: Add missing hasConflicts method
  hasConflicts(): boolean {
    const course = this.course();
    if (!course?.schedule) return false;

    // Check if any schedule item has conflicts
    return course.schedule.some((_, index) => this.checkTimeConflict(index));
  }

  // FIX: Add missing isScheduledTime method for calendar view
  isScheduledTime(dayOfWeek: number, timeSlot: string): boolean {
    const course = this.course();
    if (!course?.schedule) return false;

    return course.schedule.some(scheduleItem => {
      if (scheduleItem.dayOfWeek !== dayOfWeek) return false;

      const slotTime = this.convertToMinutes(timeSlot);
      const startTime = this.convertToMinutes(scheduleItem.startTime);
      const endTime = this.convertToMinutes(scheduleItem.endTime);

      return slotTime >= startTime && slotTime < endTime;
    });
  }

  // FIX: Add missing convertToMinutes helper method
  private convertToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  // FIX: Add missing enhanced conflict checking method
  checkScheduleConflicts(): void {
    const formValue = this.scheduleForm.getRawValue();
    const classroomId = formValue.classroomId;
    const scheduleItems = formValue.schedule;

    if (!classroomId || !scheduleItems?.length) return;

    // This would typically check against other courses in the same classroom
    // For now, we'll just check for internal conflicts within the same course
    for (let i = 0; i < scheduleItems.length; i++) {
      for (let j = i + 1; j < scheduleItems.length; j++) {
        const item1 = scheduleItems[i];
        const item2 = scheduleItems[j];

        if (item1.dayOfWeek === item2.dayOfWeek) {
          const start1 = this.convertToMinutes(item1.startTime);
          const end1 = this.convertToMinutes(item1.endTime);
          const start2 = this.convertToMinutes(item2.startTime);
          const end2 = this.convertToMinutes(item2.endTime);

          // Check for overlap
          if ((start1 < end2 && end1 > start2)) {
            this.notificationService.showWarning(
              `Time conflict detected on ${this.getDayLabel(item1.dayOfWeek)}`
            );
          }
        }
      }
    }
  }

  // FIX: Add missing method for getting selected classroom details
  getSelectedClassroom(): Classroom | null {
    const classroomId = this.scheduleForm.get('classroomId')?.value;
    if (!classroomId) return null;

    return this.classrooms().find(c => c.id === classroomId) || null;
  }

  // FIX: Add missing method for validating schedule form
  validateScheduleForm(): boolean {
    if (!this.scheduleForm.valid) return false;

    const scheduleItems = this.scheduleArray.value;

    // Check if all time slots are valid (end time after start time)
    for (const item of scheduleItems) {
      const startTime = this.convertToMinutes(item.startTime);
      const endTime = this.convertToMinutes(item.endTime);

      if (endTime <= startTime) {
        this.notificationService.showError('End time must be after start time');
        return false;
      }
    }

    return true;
  }

  // FIX: Override onSubmit to include validation
  onSubmitWithValidation(): void {
    if (!this.validateScheduleForm()) return;

    this.checkScheduleConflicts();
    this.onSubmit();
  }

  // FIX: Add missing method for getting total weekly hours
  getTotalWeeklyHours(): string {
    const course = this.course();
    if (!course?.schedule) return '0h';

    const totalMinutes = course.schedule.reduce((total, item) => {
      const startTime = this.convertToMinutes(item.startTime);
      const endTime = this.convertToMinutes(item.endTime);
      return total + (endTime - startTime);
    }, 0);

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }

  // FIX: Add missing method for getting schedule summary
  getScheduleSummary(): string {
    const course = this.course();
    if (!course?.schedule?.length) return 'No schedule set';

    const days = course.schedule.map(item => this.daysOfWeek.find(d => d.value === item.dayOfWeek)?.short).filter(Boolean);
    const uniqueDays = [...new Set(days)];

    return `${uniqueDays.join(', ')} - ${this.getTotalWeeklyHours()} per week`;
  }
}
