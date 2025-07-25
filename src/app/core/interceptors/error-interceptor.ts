import { HttpInterceptorFn } from '@angular/common/http';

export const ErrorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req);
};
