import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const reviewGuard: CanActivateFn = () => {
  const auth = inject(AuthService) as AuthService;
  const router = inject(Router);

  // Solo empresa no aprobada
  if (auth.isAdmin() && !auth.isApproved()) return true;

  // Si ya está aprobado, al admin
  if (auth.isAdmin() && auth.isApproved()) {
    router.navigateByUrl('/admin');
    return false;
  }

  // Otros, al home
  router.navigateByUrl('/home');
  return false;
};
