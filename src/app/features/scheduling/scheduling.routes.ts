import { Routes } from '@angular/router';

export const schedulingRoutes: Routes = [
  { path: '', redirectTo: '/scheduling/overview', pathMatch: 'full' },
  {
    path: 'overview',
    loadComponent: () => import('./schedule-overview/schedule-overview').then(m => m.ScheduleOverview)
  },
  {
    path: 'calendar',
    loadComponent: () => import('./schedule-calendar/schedule-calendar').then(m => m.ScheduleCalendar)
  },
  {
    path: 'timetable',
    loadComponent: () => import('./timetable/timetable').then(m => m.Timetable)
  },
  {
    path: 'conflicts',
    loadComponent: () => import('./schedule-conflict/schedule-conflict').then(m => m.ScheduleConflictComponent)
  },
  {
    path: 'new',
    loadComponent: () => import('./schedule-form/schedule-form').then(m => m.ScheduleForm)
  },
  {
    path: 'edit/:id',
    loadComponent: () => import('./schedule-form/schedule-form').then(m => m.ScheduleForm)
  }
];
