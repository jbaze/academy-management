import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { Auth} from '../services/auth';
import { UserRole } from '../models/role';

export const roleGuard: CanActivateFn = (route) => {
  const authService = inject(Auth);
  const router = inject(Router);

  const requiredRoles = route.data?.['roles'] as UserRole[];

  if (!requiredRoles || requiredRoles.length === 0) {
    return true;
  }

  if (authService.hasAnyRole(requiredRoles)) {
    return true;
  }

  router.navigate(['/unauthorized']);
  return false;
};
