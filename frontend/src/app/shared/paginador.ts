import { Component, computed, input, output } from '@angular/core';
import { PaginaInfo } from '../core/models/pagina';

@Component({
  selector: 'app-paginador',
  imports: [],
  templateUrl: './paginador.html',
  styleUrl: './paginador.css',
})
export class PaginadorComponent {
  readonly pagina = input.required<PaginaInfo>();
  readonly paginaCambiada = output<number>();

  protected readonly totalPaginas = computed(() =>
    Math.max(1, this.pagina().totalPages),
  );
  protected readonly hayAnterior = computed(() => this.pagina().number > 0);
  protected readonly haySiguiente = computed(
    () => this.pagina().number < this.pagina().totalPages - 1,
  );

  anterior(): void {
    this.paginaCambiada.emit(this.pagina().number - 1);
  }

  siguiente(): void {
    this.paginaCambiada.emit(this.pagina().number + 1);
  }
}
