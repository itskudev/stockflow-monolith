import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Pagina } from '../core/models/pagina';
import { EstadoPedido } from '../shared/estado-pedido';
import {
  EstadoPedidoRequest,
  PedidoRequest,
  PedidoResumenResponse,
  PedidoResponse,
} from './pedido.model';

@Injectable({ providedIn: 'root' })
export class PedidoService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/pedidos`;

  listar(
    estado: EstadoPedido | null,
    clienteId: number | null,
    pagina: number,
  ): Observable<Pagina<PedidoResumenResponse>> {
    let params = new HttpParams().set('page', pagina);
    if (estado) {
      params = params.set('estado', estado);
    }
    if (clienteId !== null) {
      params = params.set('clienteId', clienteId);
    }
    return this.http.get<Pagina<PedidoResumenResponse>>(this.base, { params });
  }

  obtener(id: number): Observable<PedidoResponse> {
    return this.http.get<PedidoResponse>(`${this.base}/${id}`);
  }

  crear(request: PedidoRequest): Observable<PedidoResponse> {
    return this.http.post<PedidoResponse>(this.base, request);
  }

  cambiarEstado(id: number, estado: EstadoPedido): Observable<PedidoResponse> {
    const body: EstadoPedidoRequest = { estado };
    return this.http.patch<PedidoResponse>(`${this.base}/${id}/estado`, body);
  }
}
