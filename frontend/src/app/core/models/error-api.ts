import { HttpErrorResponse } from '@angular/common/http';

export interface ErrorApi {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
  errors?: Record<string, string>;
}

export function mensajeDeError(error: unknown): string | null {
  if (!(error instanceof HttpErrorResponse)) {
    return null;
  }
  if (error.status === 0) {
    return 'No se pudo conectar con el servidor';
  }
  const cuerpo = error.error as Partial<ErrorApi> | null;
  if (cuerpo && typeof cuerpo === 'object') {
    const partes: string[] = [];
    if (cuerpo.message) {
      partes.push(cuerpo.message);
    }
    if (cuerpo.errors) {
      for (const [campo, mensaje] of Object.entries(cuerpo.errors)) {
        partes.push(`${campo}: ${mensaje}`);
      }
    }
    if (partes.length > 0) {
      return partes.join(' · ');
    }
  }
  return `Error ${error.status}`;
}
