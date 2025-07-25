import { Routes } from '@angular/router';

export const dashboardRoutes: Routes = [
  { path: '', redirectTo: '/dashboard/admin', pathMatch: 'full' },
  {
    path: 'admin',
    loadComponent: () => import('./admin-dashboard/admin-dashboard').then(m => m.AdminDashboard)
  },
  {
    path: 'mentor',
    loadComponent: () => import('./mentor-dashboard/mentor-dashboard').then(m => m.MentorDashboard)
  },
  {
    path: 'parent',
    loadComponent: () => import('./parent-dashboard/parent-dashboard').then(m => m.ParentDashboard)
  }
];
