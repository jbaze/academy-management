import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Classroom, ClassroomSchedule } from '../models/classroom';
import { ClassroomService } from '../services/classroom';
import { NotificationService } from '../../../core/services/notification';

@Component({
  selector: 'app-classroom-schedule',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './classroom-schedule.html',
  styleUrl: './classroom-schedule.scss'
})
export class ClassroomScheduleComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private classroomService = inject(ClassroomService);
  private notificationService = inject(NotificationService);

  classroom = signal<Classroom | null>(null);
  schedule = signal<ClassroomSchedule[]>([]);
  isLoading = signal(false);

  daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadClassroom(id);
      this.loadSchedule(id);
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

  private loadSchedule(classroomId: string): void {
    this.isLoading.set(true);
    this.classroomService.getClassroomSchedule(classroomId).subscribe({
      next: (schedule) => {
        this.schedule.set(schedule);
        this.isLoading.set(false);
      },
      error: () => {
        this.notificationService.showError('Failed to load classroom schedule');
        this.isLoading.set(false);
      }
    });
  }

  getScheduleByDay(dayOfWeek: number): ClassroomSchedule[] {
    return this.schedule().filter(s => s.dayOfWeek === dayOfWeek);
  }
}
