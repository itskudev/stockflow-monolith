import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../core/auth/auth.service';
import { Rol } from '../core/auth/sesion.model';

export interface EnlaceMenu {
  etiqueta: string;
  ruta: string;
  roles: Rol[];
}

const ENLACES: EnlaceMenu[] = [
  { etiqueta: 'Inicio', ruta: '/', roles: ['ADMIN', 'VENDEDOR', 'ALMACENERO'] },
  { etiqueta: 'Categorías', ruta: '/categorias', roles: ['ADMIN', 'VENDEDOR', 'ALMACENERO'] },
  { etiqueta: 'Productos', ruta: '/productos', roles: ['ADMIN', 'VENDEDOR', 'ALMACENERO'] },
  { etiqueta: 'Clientes', ruta: '/clientes', roles: ['ADMIN', 'VENDEDOR'] },
  { etiqueta: 'Pedidos', ruta: '/pedidos', roles: ['ADMIN', 'VENDEDOR'] },
  { etiqueta: 'Movimientos', ruta: '/movimientos', roles: ['ADMIN', 'ALMACENERO'] },
  { etiqueta: 'Stock bajo', ruta: '/stock-bajo', roles: ['ADMIN', 'ALMACENERO'] },
];

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './shell.html',
  styleUrl: './shell.css',
})
export class ShellComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly sesion = this.auth.sesion;
  protected readonly enlaces = computed(() => {
    const rol = this.auth.rol();
    return ENLACES.filter((enlace) => rol !== null && enlace.roles.includes(rol));
  });

  salir(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
