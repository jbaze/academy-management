import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ScheduleService } from '../services/schedule';
import { Schedule } from '../models/schedule';

@Component({
  selector: 'app-timetable',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './timetable.html',
  styleUrl: './timetable.scss'
})
export class Timetable implements OnInit {
  private scheduleService = inject(ScheduleService);

  schedules = signal<Schedule[]>([]);
  selectedClassroom = signal<string>('all');

  daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
  ];

  ngOnInit(): void {
    this.loadSchedules();
  }

  private loadSchedules(): void {
    this.scheduleService.getSchedules().subscribe({
      next: (schedules) => {
        this.schedules.set(schedules.filter(s => s.isActive));
      }
    });
  }

  getSchedulesForTimeSlot(timeSlot: string, dayIndex: number): Schedule[] {
    return this.schedules().filter(schedule => {
      const scheduleStart = this.timeToMinutes(schedule.startTime);
      const scheduleEnd = this.timeToMinutes(schedule.endTime);
      const slotTime = this.timeToMinutes(timeSlot);

      return schedule.dayOfWeek === (dayIndex + 1) % 7 &&
             slotTime >= scheduleStart &&
             slotTime < scheduleEnd &&
             (this.selectedClassroom() === 'all' || schedule.classroomId === this.selectedClassroom());
    });
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  getScheduleColor(schedule: Schedule): string {
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-purple-500',
      'bg-red-500', 'bg-yellow-500', 'bg-indigo-500'
    ];
    const index = schedule.courseId.charCodeAt(0) % colors.length;
    return colors[index];
  }

  onClassroomChange(classroomId: string): void {
    this.selectedClassroom.set(classroomId);
  }
}
