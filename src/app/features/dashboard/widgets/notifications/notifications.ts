import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../../../core/services/notification';

interface DashboardNotification {
  id: string;
  type: 'info' | 'warning' | 'success' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  actionUrl?: string;
  actionText?: string;
}

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notifications.html',
  styleUrl: './notifications.scss'
})
export class NotificationsComponent {
  @Input() notifications: DashboardNotification[] = [];
  @Input() loading: boolean = false;

  private notificationService = inject(NotificationService);

  mockNotifications: DashboardNotification[] = [
    {
      id: '1',
      type: 'info',
      title: 'New Student Enrollment',
      message: 'John Doe has enrolled in Advanced Mathematics',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      isRead: false,
      actionUrl: '/students',
      actionText: 'View Student'
    },
    {
      id: '2',
      type: 'warning',
      title: 'Payment Overdue',
      message: 'Invoice #1234 is 5 days overdue',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
      isRead: false,
      actionUrl: '/billing',
      actionText: 'View Invoice'
    },
    {
      id: '3',
      type: 'success',
      title: 'Course Completed',
      message: 'Physics Fundamentals course has been completed by 12 students',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      isRead: true
    }
  ];

  ngOnInit(): void {
    if (this.notifications.length === 0) {
      this.notifications = this.mockNotifications;
    }
  }

  getNotificationIcon(type: string): string {
    const iconMap: { [key: string]: string } = {
      info: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      warning: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z',
      success: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      error: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z'
    };
    return iconMap[type] || iconMap['info'];
  }

  getNotificationColor(type: string): string {
    const colorMap: { [key: string]: string } = {
      info: 'text-blue-600 bg-blue-100',
      warning: 'text-yellow-600 bg-yellow-100',
      success: 'text-green-600 bg-green-100',
      error: 'text-red-600 bg-red-100'
    };
    return colorMap[type] || 'text-gray-600 bg-gray-100';
  }

  markAsRead(notification: DashboardNotification): void {
    notification.isRead = true;
  }

  markAllAsRead(): void {
    this.notifications.forEach(n => n.isRead = true);
  }

  getUnreadCount(): number {
    return this.notifications.filter(n => !n.isRead).length;
  }

  formatTimeAgo(date: Date): string {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;

    return date.toLocaleDateString();
  }
}
