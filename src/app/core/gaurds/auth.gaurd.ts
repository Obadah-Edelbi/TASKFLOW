import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

// Guard على شكل Function (Angular الجديد)
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // إذا المستخدم مسجل دخول
  if (authService.isLoggedIn()) {
    return true; // اسمح له يفوت
  }

  // إذا لا → رجعه على login
  router.navigate(['/login']);
  return false;
};
