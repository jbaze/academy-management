import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Classroom } from '../models/classroom';
import { ClassroomService } from '../services/classroom';
import { NotificationService } from '../../../core/services/notification';

@Component({
  selector: 'app-classroom-availability',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './classroom-availability.html',
  styleUrl: './classroom-availability.scss'
})
export class ClassroomAvailability implements OnInit {
  private route = inject(ActivatedRoute);
  private formBuilder = inject(FormBuilder);
  private classroomService = inject(ClassroomService);
  private notificationService = inject(NotificationService);

  classroom = signal<Classroom | null>(null);
  availabilityResult = signal<boolean | null>(null);
  isChecking = signal(false);

  availabilityForm: FormGroup;
  daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  constructor() {
    this.availabilityForm = this.formBuilder.group({
      dayOfWeek: ['', Validators.required],
      startTime: ['', Validators.required],
      endTime: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadClassroom(id);
    }
  }

  private loadClassroom(id: string): void {
    this.classroomService.getClassroomById(id).subscribe({
      next: (classroom) => {
        this.classroom.set(classroom || null);
      },
      error: () => {
        this.notificationService.showError('Failed to load classroom');
      }
    });
  }

  checkAvailability(): void {
    if (this.availabilityForm.valid && this.classroom()) {
      this.isChecking.set(true);
      this.availabilityResult.set(null);

      const { dayOfWeek, startTime, endTime } = this.availabilityForm.value;

      this.classroomService.checkAvailability(
        this.classroom()!.id,
        parseInt(dayOfWeek),
        startTime,
        endTime
      ).subscribe({
        next: (isAvailable) => {
          this.availabilityResult.set(isAvailable);
          this.isChecking.set(false);
        },
        error: () => {
          this.notificationService.showError('Failed to check availability');
          this.isChecking.set(false);
        }
      });
    }
  }
}
