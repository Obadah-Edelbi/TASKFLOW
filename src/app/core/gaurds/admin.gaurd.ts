import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // لازم يكون مسجّل + أدمن
  if (authService.isLoggedIn() && authService.isAdmin()) {
    return true;
  }

  // غير مسموح → رجّعه عالداشبورد
  router.navigate(['/dashboard']);
  return false;
};
