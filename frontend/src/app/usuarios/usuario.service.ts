import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Pagina } from '../core/models/pagina';
import {
  RolResponse,
  UsuarioActivoRequest,
  UsuarioCreateRequest,
  UsuarioResponse,
  UsuarioUpdateRequest,
} from './usuario.model';

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/usuarios`;
  private readonly baseRoles = `${environment.apiUrl}/roles`;

  listar(pagina: number): Observable<Pagina<UsuarioResponse>> {
    const params = new HttpParams().set('page', pagina);
    return this.http.get<Pagina<UsuarioResponse>>(this.base, { params });
  }

  roles(): Observable<RolResponse[]> {
    return this.http.get<RolResponse[]>(this.baseRoles);
  }

  crear(request: UsuarioCreateRequest): Observable<UsuarioResponse> {
    return this.http.post<UsuarioResponse>(this.base, request);
  }

  actualizar(id: number, request: UsuarioUpdateRequest): Observable<UsuarioResponse> {
    return this.http.put<UsuarioResponse>(`${this.base}/${id}`, request);
  }

  cambiarActivo(id: number, activo: boolean): Observable<UsuarioResponse> {
    const body: UsuarioActivoRequest = { activo };
    return this.http.patch<UsuarioResponse>(`${this.base}/${id}/activo`, body);
  }
}
