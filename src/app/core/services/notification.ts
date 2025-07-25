import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface NotificationItem {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationsSubject = new BehaviorSubject<NotificationItem[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();

  showSuccess(message: string, duration = 5000): void {
    this.addNotification('success', message, duration);
  }

  showError(message: string, duration = 7000): void {
    this.addNotification('error', message, duration);
  }

  showWarning(message: string, duration = 6000): void {
    this.addNotification('warning', message, duration);
  }

  showInfo(message: string, duration = 5000): void {
    this.addNotification('info', message, duration);
  }

  private addNotification(type: NotificationItem['type'], message: string, duration: number): void {
    const notification: NotificationItem = {
      id: this.generateId(),
      type,
      message,
      duration,
      timestamp: new Date()
    };

    const notifications = this.notificationsSubject.value;
    this.notificationsSubject.next([...notifications, notification]);

    if (duration > 0) {
      setTimeout(() => this.removeNotification(notification.id), duration);
    }
  }

  removeNotification(id: string): void {
    const notifications = this.notificationsSubject.value.filter(n => n.id !== id);
    this.notificationsSubject.next(notifications);
  }

  clearAll(): void {
    this.notificationsSubject.next([]);
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}
