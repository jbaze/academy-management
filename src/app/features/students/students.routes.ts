import { Routes } from '@angular/router';

export const studentsRoutes: Routes = [
  { path: '', redirectTo: '/students/list', pathMatch: 'full' },
  {
    path: 'list',
    loadComponent: () => import('./student-list/student-list').then(m => m.StudentList)
  },
  {
    path: 'new',
    loadComponent: () => import('./student-form/student-form').then(m => m.StudentForm)
  },
  {
    path: ':id',
    loadComponent: () => import('./student-detail/student-detail').then(m => m.StudentDetail)
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./student-form/student-form').then(m => m.StudentForm)
  },
  {
    path: ':id/enrollment',
    loadComponent: () => import('./student-enrollment/student-enrollment').then(m => m.StudentEnrollment)
  },
  {
    path: ':id/progress',
    loadComponent: () => import('./student-progress/student-progress').then(m => m.StudentProgressComponent)
  },
  {
    path: ':id/attendance',
    loadComponent: () => import('./student-attendance/student-attendance').then(m => m.StudentAttendance)
  }
];
