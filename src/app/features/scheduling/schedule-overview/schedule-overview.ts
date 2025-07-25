import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ScheduleService } from '../services/schedule';
import { Schedule, ScheduleConflict } from '../models/schedule';

@Component({
  selector: 'app-schedule-overview',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './schedule-overview.html',
  styleUrl: './schedule-overview.scss'
})
export class ScheduleOverview implements OnInit {
  private scheduleService = inject(ScheduleService);

  schedules = signal<Schedule[]>([]);
  conflicts = signal<ScheduleConflict[]>([]);
  isLoading = signal(false);

  stats = signal({
    totalSchedules: 0,
    activeSchedules: 0,
    conflicts: 0,
    classroomsInUse: 0
  });

  ngOnInit(): void {
    this.loadOverviewData();
  }

  private loadOverviewData(): void {
    this.isLoading.set(true);

    // Load schedules
    this.scheduleService.getSchedules().subscribe({
      next: (schedules) => {
        this.schedules.set(schedules);
        this.updateStats(schedules);
      }
    });

    // Load conflicts
    this.scheduleService.getConflicts().subscribe({
      next: (conflicts) => {
        this.conflicts.set(conflicts);
      }
    });

    this.isLoading.set(false);
  }

  private updateStats(schedules: Schedule[]): void {
    const activeSchedules = schedules.filter(s => s.isActive);
    const classroomIds = new Set(schedules.map(s => s.classroomId));

    this.stats.set({
      totalSchedules: schedules.length,
      activeSchedules: activeSchedules.length,
      conflicts: this.conflicts().length,
      classroomsInUse: classroomIds.size
    });
  }

  getDayName(dayOfWeek: number): string {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayOfWeek];
  }

  getConflictSeverityColor(severity: string): string {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  }
}
