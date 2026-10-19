import { Rol } from '../core/auth/sesion.model';

export interface RolResponse {
  id: number;
  nombre: Rol;
}

export interface UsuarioResponse {
  id: number;
  nombre: string;
  email: string;
  activo: boolean;
  rol: Rol;
  fechaCreacion: string;
}

export interface UsuarioCreateRequest {
  nombre: string;
  email: string;
  password: string;
  rolId: number;
}

export interface UsuarioUpdateRequest {
  nombre: string;
  email: string;
  rolId: number;
}

export interface UsuarioActivoRequest {
  activo: boolean;
}
