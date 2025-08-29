import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService) as AuthService;
  const router = inject(Router);

  if (auth.isAdmin() && auth.isApproved()) return true;

  if (auth.isAdmin() && !auth.isApproved()) {
    router.navigateByUrl('/revision');
    return false;
  }

  router.navigateByUrl('/home');
  return false;
};
