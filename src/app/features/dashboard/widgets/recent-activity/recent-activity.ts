import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivityItem } from '../../services/dashboard';

@Component({
  selector: 'app-recent-activity',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './recent-activity.html',
  styleUrl: './recent-activity.scss'
})
export class RecentActivity {
  @Input() activities: ActivityItem[] = [];
  @Input() loading: boolean = false;

  getActivityIcon(type: string): string {
    const iconMap: { [key: string]: string } = {
      enrollment: 'M12 14l9-5-9-5-9 5 9 5z',
      course_created: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
      student_added: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
      mentor_assigned: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
    };
    return iconMap[type] || iconMap['enrollment'];
  }

  getActivityColor(type: string): string {
    const colorMap: { [key: string]: string } = {
      enrollment: 'text-blue-600 bg-blue-100',
      course_created: 'text-green-600 bg-green-100',
      student_added: 'text-purple-600 bg-purple-100',
      mentor_assigned: 'text-yellow-600 bg-yellow-100'
    };
    return colorMap[type] || 'text-gray-600 bg-gray-100';
  }

  formatTimeAgo(date: Date): string {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;

    return date.toLocaleDateString();
  }

  trackByActivityId(index: number, activity: ActivityItem): string {
    return activity.id;
  }
}
