import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { CategoriaRequest, CategoriaResponse } from './categoria.model';

@Injectable({ providedIn: 'root' })
export class CategoriaService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/categorias`;

  listar(): Observable<CategoriaResponse[]> {
    return this.http.get<CategoriaResponse[]>(this.base);
  }

  crear(request: CategoriaRequest): Observable<CategoriaResponse> {
    return this.http.post<CategoriaResponse>(this.base, request);
  }

  actualizar(id: number, request: CategoriaRequest): Observable<CategoriaResponse> {
    return this.http.put<CategoriaResponse>(`${this.base}/${id}`, request);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
