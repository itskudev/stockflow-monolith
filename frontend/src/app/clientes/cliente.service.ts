import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Pagina } from '../core/models/pagina';
import { ClienteRequest, ClienteResponse } from './cliente.model';

@Injectable({ providedIn: 'root' })
export class ClienteService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/clientes`;

  listar(q: string | null, pagina: number, size?: number): Observable<Pagina<ClienteResponse>> {
    let params = new HttpParams().set('page', pagina);
    if (q) {
      params = params.set('q', q);
    }
    if (size !== undefined) {
      params = params.set('size', size);
    }
    return this.http.get<Pagina<ClienteResponse>>(this.base, { params });
  }

  crear(request: ClienteRequest): Observable<ClienteResponse> {
    return this.http.post<ClienteResponse>(this.base, request);
  }

  actualizar(id: number, request: ClienteRequest): Observable<ClienteResponse> {
    return this.http.put<ClienteResponse>(`${this.base}/${id}`, request);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
