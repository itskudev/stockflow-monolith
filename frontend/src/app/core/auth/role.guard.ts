import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { Rol } from './sesion.model';

export const roleGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isLoggedIn()) {
    return router.createUrlTree(['/login']);
  }

  const roles = route.data['roles'] as Rol[] | undefined;
  if (!roles) {
    return true;
  }

  const rolActual = auth.rol();
  return rolActual !== null && roles.includes(rolActual) ? true : router.createUrlTree(['/']);
};
