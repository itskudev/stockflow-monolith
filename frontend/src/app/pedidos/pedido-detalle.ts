import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { mensajeDeError } from '../core/models/error-api';
import { EstadoPedido, EstadoPedidoComponent } from '../shared/estado-pedido';
import { MensajeComponent } from '../shared/mensaje';
import { PedidoResponse } from './pedido.model';
import { PedidoService } from './pedido.service';

@Component({
  selector: 'app-pedido-detalle',
  imports: [RouterLink, DatePipe, DecimalPipe, EstadoPedidoComponent, MensajeComponent],
  templateUrl: './pedido-detalle.html',
  styleUrl: './pedido-detalle.css',
})
export class PedidoDetalleComponent {
  private readonly service = inject(PedidoService);
  private readonly ruta = inject(ActivatedRoute);
  private readonly id = signal<number | null>(null);

  readonly pedido = signal<PedidoResponse | null>(null);
  readonly error = signal<string | null>(null);

  constructor() {
    this.ruta.paramMap.pipe(takeUntilDestroyed()).subscribe((params) => {
      const id = Number(params.get('id'));
      this.id.set(Number.isNaN(id) ? null : id);
      this.cargar();
    });
  }

  cargar(): void {
    const id = this.id();
    if (id === null) {
      this.error.set('Pedido no encontrado');
      return;
    }
    this.service.obtener(id).subscribe({
      next: (pedido) => this.pedido.set(pedido),
      error: (e) => this.error.set(mensajeDeError(e)),
    });
  }

  completar(): void {
    this.cambiarEstado('COMPLETADO');
  }

  cancelar(): void {
    this.cambiarEstado('CANCELADO');
  }

  private cambiarEstado(estado: EstadoPedido): void {
    const pedido = this.pedido();
    if (!pedido) {
      return;
    }
    const texto =
      estado === 'COMPLETADO'
        ? `¿Completar el pedido #${pedido.id}?`
        : `¿Cancelar el pedido #${pedido.id}? El stock de sus productos se repondrá.`;
    if (!confirm(texto)) {
      return;
    }

    this.error.set(null);
    this.service.cambiarEstado(pedido.id, estado).subscribe({
      next: () => this.cargar(),
      error: (e) => {
        this.error.set(mensajeDeError(e));
        this.cargar();
      },
    });
  }
}
