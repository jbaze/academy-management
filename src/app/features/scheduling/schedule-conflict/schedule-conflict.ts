import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ScheduleService } from '../services/schedule';
import { ScheduleConflict } from '../models/schedule';

@Component({
  selector: 'app-schedule-conflict',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './schedule-conflict.html',
  styleUrl: './schedule-conflict.scss'
})
export class ScheduleConflictComponent implements OnInit {
  private scheduleService = inject(ScheduleService);

  conflicts = signal<ScheduleConflict[]>([]);
  isLoading = signal(false);
  selectedSeverity = signal<string>('all');

  severityOptions = [
    { value: 'all', label: 'All Conflicts' },
    { value: 'high', label: 'High Priority' },
    { value: 'medium', label: 'Medium Priority' },
    { value: 'low', label: 'Low Priority' }
  ];

  ngOnInit(): void {
    this.loadConflicts();
  }

  private loadConflicts(): void {
    this.isLoading.set(true);
    this.scheduleService.getConflicts().subscribe({
      next: (conflicts) => {
        this.conflicts.set(conflicts);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  getFilteredConflicts(): ScheduleConflict[] {
    const severity = this.selectedSeverity();
    if (severity === 'all') {
      return this.conflicts();
    }
    return this.conflicts().filter(c => c.severity === severity);
  }

  getConflictSeverityColor(severity: string): string {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-100 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'low': return 'text-blue-600 bg-blue-100 border-blue-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  }

  getConflictTypeIcon(type: string): string {
    switch (type) {
      case 'mentor': return 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z';
      case 'classroom': return 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4';
      case 'student': return 'M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z';
      default: return 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z';
    }
  }

  resolveConflict(conflictId: string): void {
    this.scheduleService.resolveConflict(conflictId).subscribe({
      next: () => {
        const conflicts = this.conflicts();
        const conflict = conflicts.find(c => c.id === conflictId);
        if (conflict) {
          conflict.isResolved = true;
          this.conflicts.set([...conflicts]);
        }
      }
    });
  }

  onSeverityChange(severity: string): void {
    this.selectedSeverity.set(severity);
  }
}
