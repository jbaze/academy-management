import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { UserRole } from '../../../../core/models/role';

interface QuickAction {
  title: string;
  description: string;
  icon: string;
  route: string;
  color: string;
  roles: UserRole[];
}

@Component({
  selector: 'app-quick-actions',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './quick-actions.html',
  styleUrl: './quick-actions.scss'
})
export class QuickActions {
  @Input() userRole: UserRole = UserRole.ADMIN;

  quickActions: QuickAction[] = [
    {
      title: 'Add Student',
      description: 'Register a new student',
      icon: 'user-plus',
      route: '/students/new',
      color: 'bg-blue-50 text-blue-600 hover:bg-blue-100',
      roles: [UserRole.ADMIN, UserRole.PARENT]
    },
    {
      title: 'Add Mentor',
      description: 'Register a new mentor',
      icon: 'user-check',
      route: '/mentors/new',
      color: 'bg-green-50 text-green-600 hover:bg-green-100',
      roles: [UserRole.ADMIN]
    },
    {
      title: 'Create Course',
      description: 'Set up a new course',
      icon: 'book-open',
      route: '/courses/new',
      color: 'bg-purple-50 text-purple-600 hover:bg-purple-100',
      roles: [UserRole.ADMIN]
    },
    {
      title: 'Schedule Class',
      description: 'Schedule a new class',
      icon: 'calendar',
      route: '/scheduling/new',
      color: 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100',
      roles: [UserRole.ADMIN, UserRole.MENTOR]
    },
    {
      title: 'View Students',
      description: 'Manage your students',
      icon: 'users',
      route: '/students',
      color: 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100',
      roles: [UserRole.MENTOR, UserRole.PARENT]
    },
    {
      title: 'View Billing',
      description: 'Check invoices and payments',
      icon: 'credit-card',
      route: '/billing',
      color: 'bg-red-50 text-red-600 hover:bg-red-100',
      roles: [UserRole.ADMIN, UserRole.PARENT]
    }
  ];

  getActionsForRole(): QuickAction[] {
    return this.quickActions.filter(action => action.roles.includes(this.userRole));
  }

  getActionIcon(icon: string): string {
    const iconMap: { [key: string]: string } = {
      'user-plus': 'M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z',
      'user-check': 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      'book-open': 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
      'calendar': 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
      'users': 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z',
      'credit-card': 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z'
    };
    return iconMap[icon] || iconMap['book-open'];
  }
}
