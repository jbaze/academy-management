import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { UpcomingClass } from '../../services/dashboard';

@Component({
  selector: 'app-upcoming-classes',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './upcoming-classes.html',
  styleUrl: './upcoming-classes.scss'
})
export class UpcomingClasses {
  @Input() classes: UpcomingClass[] = [];
  @Input() loading: boolean = false;

  formatDate(date: Date): string {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      });
    }
  }

  getTimeUntilClass(date: Date): string {
    const now = new Date();
    const diffInMs = date.getTime() - now.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInMinutes = Math.floor((diffInMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffInHours < 1) {
      return `in ${diffInMinutes}m`;
    } else if (diffInHours < 24) {
      return `in ${diffInHours}h`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `in ${diffInDays}d`;
    }
  }

  getStatusColor(date: Date): string {
    const now = new Date();
    const diffInMs = date.getTime() - now.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);

    if (diffInHours < 2) return 'text-red-600 bg-red-100';
    if (diffInHours < 24) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  }

  trackByClassId(index: number, item: any): any {
    return item.id || index;
  }
}
