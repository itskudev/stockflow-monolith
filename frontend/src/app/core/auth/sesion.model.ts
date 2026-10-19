export type Rol = 'ADMIN' | 'VENDEDOR' | 'ALMACENERO';

export interface Sesion {
  token: string;
  nombre: string;
  email: string;
  rol: Rol;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  tipo: string;
  email: string;
  nombre: string;
  rol: Rol;
}
