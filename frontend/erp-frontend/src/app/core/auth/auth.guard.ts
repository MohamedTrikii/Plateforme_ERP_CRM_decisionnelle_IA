import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

/**
 * authGuard – functional route guard (Angular 17+).
 * Redirects unauthenticated users to /auth/login.
 */
export const authGuard: CanActivateFn = (_route, _state) => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  if (auth.isLoggedIn()) {
    return true;
  }
  router.navigate(['/auth/login']);
  return false;
};

/**
 * adminGuard – restricts routes to ADMIN role only.
 */
export const adminGuard: CanActivateFn = (_route, _state) => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  if (auth.isLoggedIn() && auth.isAdmin()) {
    return true;
  }
  router.navigate(['/dashboard']);
  return false;
};
