import { HttpInterceptorFn } from '@angular/common/http';

export const fakeApiInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req);
};
