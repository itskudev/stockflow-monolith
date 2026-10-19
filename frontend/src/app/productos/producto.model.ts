export interface ProductoResponse {
  id: number;
  sku: string;
  nombre: string;
  descripcion: string | null;
  precio: number;
  stockActual: number;
  stockMinimo: number;
  activo: boolean;
  categoriaId: number;
  categoriaNombre: string;
}

export interface ProductoRequest {
  sku: string;
  nombre: string;
  descripcion?: string | null;
  precio: number;
  stockMinimo: number;
  categoriaId: number;
}

export interface ProductoFiltros {
  q: string | null;
  categoriaId: number | null;
  activo: boolean;
}
