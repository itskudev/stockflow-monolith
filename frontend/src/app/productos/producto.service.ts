import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Pagina } from '../core/models/pagina';
import { ProductoFiltros, ProductoRequest, ProductoResponse } from './producto.model';

@Injectable({ providedIn: 'root' })
export class ProductoService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/productos`;

  listar(
    filtros: ProductoFiltros,
    pagina: number,
    size?: number,
  ): Observable<Pagina<ProductoResponse>> {
    let params = new HttpParams().set('page', pagina).set('activo', filtros.activo);
    if (filtros.q) {
      params = params.set('q', filtros.q);
    }
    if (filtros.categoriaId !== null) {
      params = params.set('categoriaId', filtros.categoriaId);
    }
    if (size !== undefined) {
      params = params.set('size', size);
    }
    return this.http.get<Pagina<ProductoResponse>>(this.base, { params });
  }

  obtener(id: number): Observable<ProductoResponse> {
    return this.http.get<ProductoResponse>(`${this.base}/${id}`);
  }

  stockBajo(): Observable<ProductoResponse[]> {
    return this.http.get<ProductoResponse[]>(`${this.base}/stock-bajo`);
  }

  crear(request: ProductoRequest): Observable<ProductoResponse> {
    return this.http.post<ProductoResponse>(this.base, request);
  }

  actualizar(id: number, request: ProductoRequest): Observable<ProductoResponse> {
    return this.http.put<ProductoResponse>(`${this.base}/${id}`, request);
  }

  eliminar(id: number): Observable<ProductoResponse> {
    return this.http.delete<ProductoResponse>(`${this.base}/${id}`);
  }
}
