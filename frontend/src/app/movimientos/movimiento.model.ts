export type TipoMovimiento = 'ENTRADA' | 'SALIDA' | 'AJUSTE';

export interface MovimientoRequest {
  productoId: number;
  tipo: TipoMovimiento;
  cantidad: number;
  motivo: string | null;
}

export interface MovimientoResponse {
  id: number;
  productoId: number;
  sku: string;
  productoNombre: string;
  tipo: TipoMovimiento;
  cantidad: number;
  motivo: string | null;
  pedidoId: number | null;
  usuarioNombre: string;
  fecha: string;
}

export interface MovimientoCreadoResponse extends MovimientoResponse {
  stockActual: number;
}

export interface MovimientoFiltros {
  productoId: number | null;
  tipo: TipoMovimiento | null;
  desde: string | null;
  hasta: string | null;
}
