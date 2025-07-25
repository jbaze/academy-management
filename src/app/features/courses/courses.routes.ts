import { Routes } from '@angular/router';

export const coursesRoutes: Routes = [
  { path: '', redirectTo: '/courses/list', pathMatch: 'full' },
  {
    path: 'list',
    loadComponent: () => import('./course-list/course-list').then(m => m.CourseList)
  },
  {
    path: 'new',
    loadComponent: () => import('./course-form/course-form').then(m => m.CourseForm)
  },
  {
    path: ':id',
    loadComponent: () => import('./course-detail/course-detail').then(m => m.CourseDetail)
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./course-form/course-form').then(m => m.CourseForm)
  },
  {
    path: ':id/enrollment',
    loadComponent: () => import('./course-enrollment/course-enrollment').then(m => m.CourseEnrollment)
  },
  {
    path: ':id/schedule',
    loadComponent: () => import('./course-schedule/course-schedule').then(m => m.CourseSchedule)
  },
  {
    path: ':id/curriculum',
    loadComponent: () => import('./course-curriculum/course-curriculum').then(m => m.CourseCurriculum)
  }
];
