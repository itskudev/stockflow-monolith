import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginRequest, LoginResponse, Rol, Sesion } from './sesion.model';

const CLAVE_SESION = 'stockflow.sesion';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly _sesion = signal<Sesion | null>(this.restaurar());

  readonly sesion = this._sesion.asReadonly();
  readonly isLoggedIn = computed(() => this._sesion() !== null);
  readonly rol = computed<Rol | null>(() => this._sesion()?.rol ?? null);

  login(credenciales: LoginRequest) {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, credenciales).pipe(
      tap((respuesta) =>
        this.guardar({
          token: respuesta.token,
          nombre: respuesta.nombre,
          email: respuesta.email,
          rol: respuesta.rol,
        }),
      ),
    );
  }

  logout(): void {
    this._sesion.set(null);
    try {
      localStorage.removeItem(CLAVE_SESION);
    } catch {}
  }

  private guardar(sesion: Sesion): void {
    this._sesion.set(sesion);
    try {
      localStorage.setItem(CLAVE_SESION, JSON.stringify(sesion));
    } catch {}
  }

  private restaurar(): Sesion | null {
    try {
      const crudo = localStorage.getItem(CLAVE_SESION);
      if (!crudo) {
        return null;
      }
      const datos = JSON.parse(crudo) as Partial<Sesion>;
      if (datos.token && datos.nombre && datos.email && datos.rol) {
        return {
          token: datos.token,
          nombre: datos.nombre,
          email: datos.email,
          rol: datos.rol,
        };
      }
    } catch {}
    return null;
  }
}
