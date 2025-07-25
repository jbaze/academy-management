import { CanActivateFn } from '@angular/router';

export const mentorGuard: CanActivateFn = (route, state) => {
  return true;
};
