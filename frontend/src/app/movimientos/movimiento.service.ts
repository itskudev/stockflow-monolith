import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Pagina } from '../core/models/pagina';
import {
  MovimientoCreadoResponse,
  MovimientoFiltros,
  MovimientoRequest,
  MovimientoResponse,
} from './movimiento.model';

@Injectable({ providedIn: 'root' })
export class MovimientoService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/movimientos`;

  listar(filtros: MovimientoFiltros, pagina: number): Observable<Pagina<MovimientoResponse>> {
    let params = new HttpParams().set('page', pagina);
    if (filtros.productoId !== null) {
      params = params.set('productoId', filtros.productoId);
    }
    if (filtros.tipo) {
      params = params.set('tipo', filtros.tipo);
    }
    if (filtros.desde) {
      params = params.set('desde', `${filtros.desde}T00:00:00`);
    }
    if (filtros.hasta) {
      params = params.set('hasta', `${filtros.hasta}T23:59:59`);
    }
    return this.http.get<Pagina<MovimientoResponse>>(this.base, { params });
  }

  crear(request: MovimientoRequest): Observable<MovimientoCreadoResponse> {
    return this.http.post<MovimientoCreadoResponse>(this.base, request);
  }
}
