import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const reviewGuard: CanActivateFn = () => {
  const auth = inject(AuthService) as AuthService;
  const router = inject(Router);


  // Otros, al home
  router.navigateByUrl('/home');
  return false;
};
