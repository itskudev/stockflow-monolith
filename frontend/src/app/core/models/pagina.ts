export interface PaginaInfo {
  size: number;
  number: number;
  totalElements: number;
  totalPages: number;
}

export interface Pagina<T> {
  content: T[];
  page: PaginaInfo;
}
