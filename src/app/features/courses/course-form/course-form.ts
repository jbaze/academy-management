import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Course } from '../models/course';
import { CourseService } from '../services/course';
import { MentorService } from '../../mentors/services/mentor';
import { ClassroomService } from '../../classrooms/services/classroom';
import { UserService } from '../../../core/services/user';
import { NotificationService } from '../../../core/services/notification';
import { Mentor } from '../../mentors/models/mentor';
import { Classroom } from '../../classrooms/models/classroom';
import { User } from '../../../core/models/user';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-course-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './course-form.html',
  styleUrl: './course-form.scss'
})
export class CourseForm implements OnInit {
  private formBuilder = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private courseService = inject(CourseService);
  private mentorService = inject(MentorService);
  private classroomService = inject(ClassroomService);
  private userService = inject(UserService);
  private notificationService = inject(NotificationService);

  courseForm: FormGroup;
  courseId = signal<string | null>(null);
  isEditing = signal(false);
  isLoading = signal(false);

  mentors = signal<{ mentor: Mentor; user: User }[]>([]);
  classrooms = signal<Classroom[]>([]);

  daysOfWeek = [
    { value: 0, label: 'Sunday' },
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' }
  ];

  categories = [
    'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science',
    'English', 'History', 'Geography', 'Art', 'Music', 'Languages', 'Other'
  ];

  levels = ['beginner', 'intermediate', 'advanced'];

  constructor() {
    this.courseForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      mentorId: ['', [Validators.required]],
      classroomId: ['', [Validators.required]],
      category: ['', [Validators.required]],
      level: ['beginner', [Validators.required]],
      duration: [12, [Validators.required, Validators.min(1), Validators.max(52)]],
      maxStudents: [15, [Validators.required, Validators.min(1), Validators.max(100)]],
      price: [0, [Validators.required, Validators.min(0)]],
      startDate: ['', [Validators.required]],
      endDate: [''],
      schedule: this.formBuilder.array([]),
      status: ['active']
    });
  }

  ngOnInit(): void {
    this.loadMentors();
    this.loadClassrooms();

    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.courseId.set(id);
      this.isEditing.set(true);
      this.loadCourse(id);
    } else {
      this.addScheduleSlot();
    }

    // Watch duration changes to calculate end date
    this.courseForm.get('duration')?.valueChanges.subscribe(() => {
      this.updateEndDate();
    });

    this.courseForm.get('startDate')?.valueChanges.subscribe(() => {
      this.updateEndDate();
    });
  }

  // ===== FIXED METHOD - PROPER OBSERVABLE HANDLING =====
  private loadMentors(): void {
    this.mentorService.getMentors().subscribe({
      next: (mentors) => {
        // Create array of user observables
        const userObservables = mentors.map(mentor =>
          this.userService.getUserById(mentor.userId)
        );

        // Execute all user requests in parallel
        forkJoin(userObservables).subscribe({
          next: (users) => {
            const mentorUsers: { mentor: Mentor; user: User }[] = [];

            users.forEach((user, index) => {
              if (user) {
                mentorUsers.push({
                  mentor: mentors[index],
                  user: user
                });
              }
            });

            this.mentors.set(mentorUsers);
          },
          error: () => {
            this.notificationService.showError('Failed to load mentors');
          }
        });
      },
      error: () => {
        this.notificationService.showError('Failed to load mentors');
      }
    });
  }

  private loadClassrooms(): void {
    this.classroomService.getClassrooms().subscribe({
      next: (classrooms) => {
        this.classrooms.set(classrooms.filter(c => c.isActive));
      },
      error: () => {
        this.notificationService.showError('Failed to load classrooms');
      }
    });
  }

  private loadCourse(id: string): void {
    this.isLoading.set(true);
    this.courseService.getCourseById(id).subscribe({
      next: (course) => {
        if (course) {
          this.populateForm(course);
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.notificationService.showError('Failed to load course');
        this.isLoading.set(false);
      }
    });
  }

  private populateForm(course: Course): void {
    this.courseForm.patchValue({
      name: course.name,
      description: course.description,
      mentorId: course.mentorId,
      classroomId: course.classroomId,
      category: course.category,
      level: course.level,
      duration: course.duration,
      maxStudents: course.maxStudents,
      price: course.price,
      startDate: new Date(course.startDate).toISOString().split('T')[0],
      endDate: new Date(course.endDate).toISOString().split('T')[0],
      status: course.status
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

  private updateEndDate(): void {
    const startDate = this.courseForm.get('startDate')?.value;
    const duration = this.courseForm.get('duration')?.value;

    if (startDate && duration) {
      const start = new Date(startDate);
      const end = new Date(start.getTime() + (duration * 7 * 24 * 60 * 60 * 1000));
      this.courseForm.patchValue({
        endDate: end.toISOString().split('T')[0]
      });
    }
  }

  get scheduleArray(): FormArray {
    return this.courseForm.get('schedule') as FormArray;
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

  onSubmit(): void {
    if (this.courseForm.valid) {
      this.isLoading.set(true);

      const formValue = this.courseForm.getRawValue();
      const courseData = {
        ...formValue,
        startDate: new Date(formValue.startDate),
        endDate: new Date(formValue.endDate),
        enrolledStudents: [],
        currentStudents: 0
      };

      const operation = this.isEditing()
        ? this.courseService.updateCourse(this.courseId()!, courseData)
        : this.courseService.createCourse(courseData);

      operation.subscribe({
        next: () => {
          this.notificationService.showSuccess(
            `Course ${this.isEditing() ? 'updated' : 'created'} successfully`
          );
          this.router.navigate(['/courses']);
        },
        error: () => {
          this.notificationService.showError(
            `Failed to ${this.isEditing() ? 'update' : 'create'} course`
          );
          this.isLoading.set(false);
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.courseForm.controls).forEach(key => {
      this.courseForm.get(key)?.markAsTouched();
    });
  }

  onCancel(): void {
    this.router.navigate(['/courses']);
  }

  // Form getters
  get name() { return this.courseForm.get('name'); }
  get description() { return this.courseForm.get('description'); }
  get mentorId() { return this.courseForm.get('mentorId'); }
  get classroomId() { return this.courseForm.get('classroomId'); }
  get category() { return this.courseForm.get('category'); }
  get level() { return this.courseForm.get('level'); }
  get duration() { return this.courseForm.get('duration'); }
  get maxStudents() { return this.courseForm.get('maxStudents'); }
  get price() { return this.courseForm.get('price'); }
  get startDate() { return this.courseForm.get('startDate'); }
}
