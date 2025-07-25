import { Routes } from '@angular/router';
import { UserRole } from './core/models/role';
import { roleGuard } from './core/guards/role-guard';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },

  // Auth routes (public)
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.authRoutes)
  },

  // Dashboard routes (protected)
  {
    path: 'dashboard',
    loadChildren: () => import('./features/dashboard/dashboard.routes').then(m => m.dashboardRoutes),
    canActivate: [authGuard]
  },

  // Students routes
  {
    path: 'students',
    loadChildren: () => import('./features/students/students.routes').then(m => m.studentsRoutes),
    canActivate: [authGuard, roleGuard],
    data: { roles: [UserRole.ADMIN, UserRole.MENTOR, UserRole.PARENT] }
  },

  // Mentors routes
  {
    path: 'mentors',
    loadChildren: () => import('./features/mentors/mentors.routes').then(m => m.mentorsRoutes),
    canActivate: [authGuard, roleGuard],
    data: { roles: [UserRole.ADMIN, UserRole.MENTOR] }
  },

  // Courses routes
  {
    path: 'courses',
    loadChildren: () => import('./features/courses/courses.routes').then(m => m.coursesRoutes),
    canActivate: [authGuard]
  },

  {
    path: 'curriculum',
    loadChildren: () => import('./features/curriculum/curriculum.routes').then(m => m.curriculumRoutes),
    canActivate: [authGuard, roleGuard],
    data: { roles: [UserRole.ADMIN, UserRole.MENTOR] }
  },

  // Classrooms routes
  {
    path: 'classrooms',
    loadChildren: () => import('./features/classrooms/classrooms.routes').then(m => m.classroomsRoutes),
    canActivate: [authGuard, roleGuard],
    data: { roles: [UserRole.ADMIN, UserRole.MENTOR] }
  },

  // Billing routes
  {
    path: 'billing',
    loadChildren: () => import('./features/billing/billing.routes').then(m => m.billingRoutes),
    canActivate: [authGuard]
  },

  // Scheduling routes
  {
    path: 'scheduling',
    loadChildren: () => import('./features/scheduling/scheduling.routes').then(m => m.schedulingRoutes),
    canActivate: [authGuard, roleGuard],
    data: { roles: [UserRole.ADMIN, UserRole.MENTOR] }
  },

  // Profile routes
  {
    path: 'profile',
    loadComponent: () => import('./features/profile/profile/profile').then(m => m.Profile),
    canActivate: [authGuard]
  },

  // Error pages
  {
    path: 'unauthorized',
    loadComponent: () => import('./shared/components/unauthorized/unauthorized').then(m => m.Unauthorized)
  },
  {
    path: 'not-found',
    loadComponent: () => import('./shared/components/not-found/not-found').then(m => m.NotFound)
  },
  { path: '**', redirectTo: '/not-found' }
];
