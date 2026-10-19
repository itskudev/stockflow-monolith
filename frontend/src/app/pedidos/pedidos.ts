import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ClienteResponse } from '../clientes/cliente.model';
import { ClienteService } from '../clientes/cliente.service';
import { mensajeDeError } from '../core/models/error-api';
import { Pagina } from '../core/models/pagina';
import { EstadoPedido, EstadoPedidoComponent } from '../shared/estado-pedido';
import { MensajeComponent } from '../shared/mensaje';
import { PaginadorComponent } from '../shared/paginador';
import { PedidoResumenResponse } from './pedido.model';
import { PedidoService } from './pedido.service';

@Component({
  selector: 'app-pedidos',
  imports: [
    RouterLink,
    DatePipe,
    DecimalPipe,
    EstadoPedidoComponent,
    MensajeComponent,
    PaginadorComponent,
  ],
  templateUrl: './pedidos.html',
  styleUrl: './pedidos.css',
})
export class PedidosComponent implements OnInit {
  private readonly service = inject(PedidoService);
  private readonly clienteService = inject(ClienteService);

  readonly pedidos = signal<Pagina<PedidoResumenResponse> | null>(null);
  readonly clientes = signal<ClienteResponse[]>([]);
  readonly error = signal<string | null>(null);
  readonly estado = signal<EstadoPedido | null>(null);
  readonly clienteId = signal<number | null>(null);
  readonly pagina = signal(0);

  ngOnInit(): void {
    this.clienteService.listar(null, 0, 1000).subscribe({
      next: (pagina) => this.clientes.set(pagina.content),
      error: (e) => this.error.set(mensajeDeError(e)),
    });
    this.cargar();
  }

  cargar(): void {
    this.service.listar(this.estado(), this.clienteId(), this.pagina()).subscribe({
      next: (pagina) => this.pedidos.set(pagina),
      error: (e) => this.error.set(mensajeDeError(e)),
    });
  }

  onEstado(event: Event): void {
    const valor = (event.target as HTMLSelectElement).value;
    this.estado.set(valor ? (valor as EstadoPedido) : null);
    this.pagina.set(0);
    this.cargar();
  }

  onCliente(event: Event): void {
    const valor = (event.target as HTMLSelectElement).value;
    this.clienteId.set(valor ? Number(valor) : null);
    this.pagina.set(0);
    this.cargar();
  }

  irAPagina(numero: number): void {
    this.pagina.set(numero);
    this.cargar();
  }
}
