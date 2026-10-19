import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
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
