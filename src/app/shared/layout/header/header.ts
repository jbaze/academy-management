import { Component, EventEmitter, Output, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NotificationService } from '../../../core/services/notification';
import { User } from '../../../core/models/user';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class Header {
  @Input() currentUser: User | null = null;
  @Output() toggleSidebar = new EventEmitter<void>();
  @Output() logout = new EventEmitter<void>();

  private notificationService = inject(NotificationService);

  dropdownOpen = false;

  onToggleSidebar(): void {
    this.toggleSidebar.emit();
  }

  onLogout(): void {
    this.logout.emit();
  }

  toggleDropdown(): void {
    this.dropdownOpen = !this.dropdownOpen;
  }

  closeDropdown(): void {
    this.dropdownOpen = false;
  }

  getUserInitials(): string {
    if (!this.currentUser) return '';
    return `${this.currentUser.firstName.charAt(0)}${this.currentUser.lastName.charAt(0)}`;
  }

  getRoleDisplayName(): string {
    if (!this.currentUser) return '';
    return this.currentUser.role.charAt(0).toUpperCase() + this.currentUser.role.slice(1);
  }

  // Mock notifications count - can be connected to real notification service
  getNotificationCount(): number {
    return 3; // Mock count
  }
}
