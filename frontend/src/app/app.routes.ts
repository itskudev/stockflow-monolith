import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { roleGuard } from './core/auth/role.guard';

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
      {
        path: 'categorias',
        canActivate: [authGuard, roleGuard],
        data: { roles: ['ADMIN', 'VENDEDOR', 'ALMACENERO'] },
        loadComponent: () => import('./categorias/categorias').then((m) => m.CategoriasComponent),
        title: 'StockFlow - Categorías',
      },
      {
        path: 'productos',
        canActivate: [authGuard, roleGuard],
        data: { roles: ['ADMIN', 'VENDEDOR', 'ALMACENERO'] },
        loadComponent: () => import('./productos/productos').then((m) => m.ProductosComponent),
        title: 'StockFlow - Productos',
      },
      {
        path: 'clientes',
        canActivate: [authGuard, roleGuard],
        data: { roles: ['ADMIN', 'VENDEDOR'] },
        loadComponent: () => import('./clientes/clientes').then((m) => m.ClientesComponent),
        title: 'StockFlow - Clientes',
      },
      // Las rutas de cada funcionalidad se agregan en sus pasos correspondientes
    ],
  },
  { path: '**', redirectTo: '' },
];
