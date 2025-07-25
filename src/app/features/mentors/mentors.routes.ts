import { Routes } from '@angular/router';

export const mentorsRoutes: Routes = [
  { path: '', redirectTo: '/mentors/list', pathMatch: 'full' },
  {
    path: 'list',
    loadComponent: () => import('./mentor-list/mentor-list').then(m => m.MentorList)
  },
  {
    path: 'new',
    loadComponent: () => import('./mentor-form/mentor-form').then(m => m.MentorForm)
  },
  {
    path: ':id',
    loadComponent: () => import('./mentor-detail/mentor-detail').then(m => m.MentorDetail)
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./mentor-form/mentor-form').then(m => m.MentorForm)
  },
  {
    path: ':id/schedule',
    loadComponent: () => import('./mentor-schedule/mentor-schedule').then(m => m.MentorSchedule)
  },
  {
    path: ':id/courses',
    loadComponent: () => import('./mentor-courses/mentor-courses').then(m => m.MentorCourses)
  },
  {
    path: ':id/students',
    loadComponent: () => import('./mentor-students/mentor-students').then(m => m.MentorStudents)
  }
];
