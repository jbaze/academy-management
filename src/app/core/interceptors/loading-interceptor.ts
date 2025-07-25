import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { Loading } from '../services/loading';

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingService = inject(Loading);

  // Don't show loading for certain requests
  if (req.url.includes('/notifications') || req.headers.has('X-Skip-Loading')) {
    return next(req);
  }

  loadingService.setLoading(true);

  return next(req).pipe(
    finalize(() => loadingService.setLoading(false))
  );
};
