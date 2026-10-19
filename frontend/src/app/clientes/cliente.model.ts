export interface ClienteResponse {
  id: number;
  nombre: string;
  documento: string;
  email: string | null;
  telefono: string | null;
  direccion: string | null;
}

export interface ClienteRequest {
  nombre: string;
  documento: string;
  email: string | null;
  telefono: string | null;
  direccion: string | null;
}
