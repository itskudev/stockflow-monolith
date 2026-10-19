import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const esApi = req.url.startsWith(environment.apiUrl);
  const esLogin = req.url === `${environment.apiUrl}/auth/login`;
  const token = auth.sesion()?.token;

  let peticion = req;
  if (esApi && token) {
    peticion = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }

  return next(peticion).pipe(
    catchError((error: unknown) => {
      const esExpirada =
        esApi && !esLogin && error instanceof HttpErrorResponse && error.status === 401;
      if (esExpirada) {
        auth.logout();
        router.navigate(['/login']);
      }
      return throwError(() => error);
    }),
  );
};
