import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./auth/login/login').then((m) => m.LoginComponent),
    title: 'StockFlow - Iniciar sesión',
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/shell').then((m) => m.ShellComponent),
    children: [
      {
        path: '',
        loadComponent: () => import('./layout/home').then((m) => m.HomeComponent),
        title: 'StockFlow - Inicio',
      },
      // Las rutas de cada funcionalidad se agregan en sus pasos correspondientes
    ],
  },
  { path: '**', redirectTo: '' },
];
