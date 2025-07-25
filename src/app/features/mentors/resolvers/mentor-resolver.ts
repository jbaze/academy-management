import { ResolveFn } from '@angular/router';

export const mentorResolver: ResolveFn<boolean> = (route, state) => {
  return true;
};
