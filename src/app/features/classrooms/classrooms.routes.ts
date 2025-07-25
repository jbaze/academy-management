import { Routes } from '@angular/router';
import { UserRole } from '../../core/models/role';
import { authGuard } from '../../core/guards/auth-guard';
import { roleGuard } from '../../core/guards/role-guard';

export const classroomsRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./classroom-list/classroom-list').then(m => m.ClassroomList),
    canActivate: [authGuard, roleGuard],
    data: { roles: [UserRole.ADMIN, UserRole.MENTOR] }
  },
  {
    path: 'new',
    loadComponent: () => import('./classroom-form/classroom-form').then(m => m.ClassroomForm),
    canActivate: [authGuard, roleGuard],
    data: { roles: [UserRole.ADMIN] }
  },
  {
    path: ':id',
    loadComponent: () => import('./classroom-detail/classroom-detail').then(m => m.ClassroomDetail),
    canActivate: [authGuard, roleGuard],
    data: { roles: [UserRole.ADMIN, UserRole.MENTOR] }
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./classroom-form/classroom-form').then(m => m.ClassroomForm),
    canActivate: [authGuard, roleGuard],
    data: { roles: [UserRole.ADMIN] }
  },
  {
    path: ':id/schedule',
    loadComponent: () => import('./classroom-schedule/classroom-schedule').then(m => m.ClassroomScheduleComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: [UserRole.ADMIN, UserRole.MENTOR] }
  },
  {
    path: ':id/availability',
    loadComponent: () => import('./classroom-availability/classroom-availability').then(m => m.ClassroomAvailability),
    canActivate: [authGuard, roleGuard],
    data: { roles: [UserRole.ADMIN, UserRole.MENTOR] }
  }
];
