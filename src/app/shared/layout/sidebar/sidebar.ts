import { Component, Input, Output, EventEmitter, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { User } from '../../../core/models/user';
import { UserRole } from '../../../core/models/role';

interface NavigationItem {
  name: string;
  href: string;
  icon: string;
  roles: UserRole[];
  badge?: number;
  children?: NavigationItem[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss'
})
export class Sidebar {
  @Input() isOpen = false;
  @Input() currentUser: User | null = null;
  @Output() closeSidebar = new EventEmitter<void>();

  private router = inject(Router);

  navigationItems: NavigationItem[] = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: 'home',
      roles: [UserRole.ADMIN, UserRole.MENTOR, UserRole.PARENT]
    },
    {
      name: 'Students',
      href: '/students',
      icon: 'users',
      roles: [UserRole.ADMIN, UserRole.MENTOR, UserRole.PARENT]
    },
    {
      name: 'Mentors',
      href: '/mentors',
      icon: 'user-check',
      roles: [UserRole.ADMIN, UserRole.MENTOR]
    },
    {
      name: 'Courses',
      href: '/courses',
      icon: 'book',
      roles: [UserRole.ADMIN, UserRole.MENTOR, UserRole.PARENT]
    },
    {
      name: 'Classrooms',
      href: '/classrooms',
      icon: 'building',
      roles: [UserRole.ADMIN, UserRole.MENTOR]
    },
    {
      name: 'Scheduling',
      href: '/scheduling',
      icon: 'calendar',
      roles: [UserRole.ADMIN, UserRole.MENTOR]
    },
    {
      name: 'Billing',
      href: '/billing',
      icon: 'credit-card',
      roles: [UserRole.ADMIN, UserRole.PARENT]
    },
    {
      name: 'Reports',
      href: '/reports',
      icon: 'chart-bar',
      roles: [UserRole.ADMIN]
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: 'cog',
      roles: [UserRole.ADMIN]
    }
  ];

  filteredNavigationItems = computed(() => {
    if (!this.currentUser) return [];
    return this.navigationItems.filter(item =>
      item.roles.includes(this.currentUser!.role)
    );
  });

  onCloseSidebar(): void {
    this.closeSidebar.emit();
  }

  onNavigate(href: string): void {
    this.router.navigate([href]);
    this.closeSidebar.emit();
  }

  getIconSvg(icon: string): string {
    const iconMap: { [key: string]: string } = {
      home: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
      users: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z',
      'user-check': 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      book: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
      building: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
      calendar: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
      'credit-card': 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
      'chart-bar': 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
      cog: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z'
    };
    return iconMap[icon] || iconMap['home'];
  }

  trackByNavigationItem(index: number, item: NavigationItem): string {
    return item.href;
  }
}
