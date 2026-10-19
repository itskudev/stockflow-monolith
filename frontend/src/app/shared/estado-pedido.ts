import { Component, input } from '@angular/core';

export type EstadoPedido = 'PENDIENTE' | 'COMPLETADO' | 'CANCELADO';

@Component({
  selector: 'app-estado-pedido',
  imports: [],
  templateUrl: './estado-pedido.html',
  styleUrl: './estado-pedido.css',
})
export class EstadoPedidoComponent {
  readonly estado = input.required<EstadoPedido>();
}
