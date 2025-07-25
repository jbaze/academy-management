import { Routes } from '@angular/router';

export const curriculumRoutes: Routes = [
  { path: '', redirectTo: 'list', pathMatch: 'full' },
  {
    path: 'list',
    loadComponent: () => import('./curriculum-list/curriculum-list').then(m => m.CurriculumList)
  },
  {
    path: 'new',
    loadComponent: () => import('./curriculum-form/curriculum-form').then(m => m.CurriculumForm)
  },
  {
    path: ':id',
    loadComponent: () => import('./curriculum-detail/curriculum-detail').then(m => m.CurriculumDetail)
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./curriculum-form/curriculum-form').then(m => m.CurriculumForm)
  },
  {
    path: ':id/modules/:moduleId/lessons/new',
    loadComponent: () => import('./lesson-form/lesson-form').then(m => m.LessonForm)
  },
  {
    path: ':id/modules/:moduleId/lessons/:lessonId/edit',
    loadComponent: () => import('./lesson-form/lesson-form').then(m => m.LessonForm)
  },
  {
    path: 'learning-paths',
    loadComponent: () => import('./learning-paths/learning-paths').then(m => m.LearningPaths)
  },
  {
    path: 'templates',
    loadComponent: () => import('./curriculum-templates/curriculum-templates').then(m => m.CurriculumTemplates)
  }
];
