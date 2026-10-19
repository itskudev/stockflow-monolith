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
      {
        path: 'pedidos',
        canActivate: [authGuard, roleGuard],
        data: { roles: ['ADMIN', 'VENDEDOR'] },
        loadComponent: () => import('./pedidos/pedidos').then((m) => m.PedidosComponent),
        title: 'StockFlow - Pedidos',
      },
      {
        path: 'pedidos/nuevo',
        canActivate: [authGuard, roleGuard],
        data: { roles: ['ADMIN', 'VENDEDOR'] },
        loadComponent: () => import('./pedidos/pedido-nuevo').then((m) => m.PedidoNuevoComponent),
        title: 'StockFlow - Nuevo pedido',
      },
      {
        path: 'pedidos/:id',
        canActivate: [authGuard, roleGuard],
        data: { roles: ['ADMIN', 'VENDEDOR'] },
        loadComponent: () =>
          import('./pedidos/pedido-detalle').then((m) => m.PedidoDetalleComponent),
        title: 'StockFlow - Pedido',
      },
      {
        path: 'movimientos',
        canActivate: [authGuard, roleGuard],
        data: { roles: ['ADMIN', 'ALMACENERO'] },
        loadComponent: () =>
          import('./movimientos/movimientos').then((m) => m.MovimientosComponent),
        title: 'StockFlow - Movimientos',
      },
      {
        path: 'stock-bajo',
        canActivate: [authGuard, roleGuard],
        data: { roles: ['ADMIN', 'ALMACENERO'] },
        loadComponent: () => import('./stock-bajo/stock-bajo').then((m) => m.StockBajoComponent),
        title: 'StockFlow - Stock bajo',
      },
      {
        path: 'usuarios',
        canActivate: [authGuard, roleGuard],
        data: { roles: ['ADMIN'] },
        loadComponent: () => import('./usuarios/usuarios').then((m) => m.UsuariosComponent),
        title: 'StockFlow - Usuarios',
      },
      // Las rutas de cada funcionalidad se agregan en sus pasos correspondientes
    ],
  },
  { path: '**', redirectTo: '' },
];
