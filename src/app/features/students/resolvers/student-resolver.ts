import { ResolveFn } from '@angular/router';

export const studentResolver: ResolveFn<boolean> = (route, state) => {
  return true;
};
