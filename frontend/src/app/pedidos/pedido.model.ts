import { EstadoPedido } from '../shared/estado-pedido';

export interface ClienteResumen {
  id: number;
  nombre: string;
}

export interface DetallePedidoRequest {
  productoId: number;
  cantidad: number;
}

export interface PedidoRequest {
  clienteId: number;
  observacion: string | null;
  detalles: DetallePedidoRequest[];
}

export interface EstadoPedidoRequest {
  estado: EstadoPedido;
}

export interface DetallePedidoResponse {
  productoId: number;
  sku: string;
  productoNombre: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface PedidoResponse {
  id: number;
  cliente: ClienteResumen;
  vendedor: string;
  estado: EstadoPedido;
  total: number;
  observacion: string | null;
  fechaCreacion: string;
  detalles: DetallePedidoResponse[];
}

export interface PedidoResumenResponse {
  id: number;
  clienteNombre: string;
  estado: EstadoPedido;
  total: number;
  fechaCreacion: string;
}
