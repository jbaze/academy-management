import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ScheduleService } from '../services/schedule';
import { Schedule } from '../models/schedule';

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  schedules: Schedule[];
  isToday: boolean;
}

interface CalendarWeek {
  days: CalendarDay[];
}

@Component({
  selector: 'app-schedule-calendar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './schedule-calendar.html',
  styleUrl: './schedule-calendar.scss'
})
export class ScheduleCalendar implements OnInit {
  private scheduleService = inject(ScheduleService);

  currentDate = signal(new Date());
  calendarWeeks = signal<CalendarWeek[]>([]);
  schedules = signal<Schedule[]>([]);
  selectedDate = signal<Date | null>(null);
  selectedSchedules = signal<Schedule[]>([]);

  monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  ngOnInit(): void {
    this.loadSchedules();
    this.generateCalendar();
  }

  private loadSchedules(): void {
    this.scheduleService.getSchedules().subscribe({
      next: (schedules) => {
        this.schedules.set(schedules);
        this.generateCalendar();
      }
    });
  }

  private generateCalendar(): void {
    const date = this.currentDate();
    const year = date.getFullYear();
    const month = date.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startCalendar = new Date(firstDay);
    startCalendar.setDate(startCalendar.getDate() - firstDay.getDay());

    const weeks: CalendarWeek[] = [];
    const currentDate = new Date(startCalendar);

    while (currentDate <= lastDay || weeks.length < 6) {
      const week: CalendarWeek = { days: [] };

      for (let i = 0; i < 7; i++) {
        const daySchedules = this.getSchedulesForDate(currentDate);

        week.days.push({
          date: new Date(currentDate),
          isCurrentMonth: currentDate.getMonth() === month,
          schedules: daySchedules,
          isToday: this.isToday(currentDate)
        });

        currentDate.setDate(currentDate.getDate() + 1);
      }

      weeks.push(week);

      if (currentDate.getMonth() !== month && weeks.length >= 4) {
        break;
      }
    }

    this.calendarWeeks.set(weeks);
  }

  private getSchedulesForDate(date: Date): Schedule[] {
    const dayOfWeek = date.getDay();
    return this.schedules().filter(schedule =>
      schedule.dayOfWeek === dayOfWeek &&
      date >= schedule.startDate &&
      date <= schedule.endDate &&
      schedule.isActive
    );
  }

  private isToday(date: Date): boolean {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }

  previousMonth(): void {
    const date = this.currentDate();
    date.setMonth(date.getMonth() - 1);
    this.currentDate.set(new Date(date));
    this.generateCalendar();
  }

  nextMonth(): void {
    const date = this.currentDate();
    date.setMonth(date.getMonth() + 1);
    this.currentDate.set(new Date(date));
    this.generateCalendar();
  }

  selectDate(day: CalendarDay): void {
    this.selectedDate.set(day.date);
    this.selectedSchedules.set(day.schedules);
  }

  getCurrentMonthYear(): string {
    const date = this.currentDate();
    return `${this.monthNames[date.getMonth()]} ${date.getFullYear()}`;
  }

  getScheduleColor(schedule: Schedule): string {
    // Generate color based on course name
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-purple-500',
      'bg-red-500', 'bg-yellow-500', 'bg-indigo-500'
    ];
    const index = schedule.courseId.charCodeAt(0) % colors.length;
    return colors[index];
  }
}
