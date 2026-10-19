import { DatePipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { AuthService } from '../core/auth/auth.service';
import { mensajeDeError } from '../core/models/error-api';
import { Pagina } from '../core/models/pagina';
import { ProductoResponse } from '../productos/producto.model';
import { ProductoService } from '../productos/producto.service';
import { MensajeComponent } from '../shared/mensaje';
import { PaginadorComponent } from '../shared/paginador';
import {
  MovimientoFiltros,
  MovimientoRequest,
  MovimientoResponse,
  TipoMovimiento,
} from './movimiento.model';
import { MovimientoService } from './movimiento.service';

@Component({
  selector: 'app-movimientos',
  imports: [ReactiveFormsModule, RouterLink, DatePipe, MensajeComponent, PaginadorComponent],
  templateUrl: './movimientos.html',
  styleUrl: './movimientos.css',
})
export class MovimientosComponent implements OnInit {
  private readonly service = inject(MovimientoService);
  private readonly productoService = inject(ProductoService);
  private readonly auth = inject(AuthService);
  private readonly ruta = inject(ActivatedRoute);
  private readonly busqueda$ = new Subject<string>();
  private readonly conocidos = signal<Map<number, ProductoResponse>>(new Map());

  readonly movimientos = signal<Pagina<MovimientoResponse> | null>(null);
  readonly productosFiltro = signal<ProductoResponse[]>([]);
  readonly resultadosBusqueda = signal<ProductoResponse[]>([]);
  readonly error = signal<string | null>(null);
  readonly exito = signal<string | null>(null);
  readonly filtroProductoId = signal<number | null>(null);
  readonly filtroTipo = signal<TipoMovimiento | null>(null);
  readonly filtroDesde = signal<string | null>(null);
  readonly filtroHasta = signal<string | null>(null);
  readonly pagina = signal(0);
  readonly enviando = signal(false);

  readonly puedeVerPedidos = computed(() => {
    const rol = this.auth.rol();
    return rol === 'ADMIN' || rol === 'VENDEDOR';
  });

  readonly form = new FormGroup({
    productoId: new FormControl<number | null>(null, { validators: [Validators.required] }),
    tipo: new FormControl<TipoMovimiento>('ENTRADA', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    cantidad: new FormControl<number | null>(null, {
      validators: [Validators.required, Validators.pattern(/^[1-9]\d*$/)],
    }),
    motivo: new FormControl('', {
      nonNullable: true,
      validators: [Validators.maxLength(255)],
    }),
    busqueda: new FormControl('', { nonNullable: true }),
  });

  constructor() {
    this.busqueda$
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe((texto) => this.buscar(texto));
    this.form.controls.tipo.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => {
      this.aplicarValidacionesDeTipo();
    });
    this.aplicarValidacionesDeTipo();
  }

  ngOnInit(): void {
    const param = this.ruta.snapshot.queryParamMap.get('productoId');
    if (param) {
      const id = Number(param);
      if (!Number.isNaN(id)) {
        this.productoService.obtener(id).subscribe({
          next: (producto) => this.preseleccionar(producto),
          error: (e) => this.error.set(mensajeDeError(e)),
        });
      }
    }
    this.productoService.listar({ q: null, categoriaId: null, activo: true }, 0, 1000).subscribe({
      next: (pagina) => this.productosFiltro.set(pagina.content),
      error: (e) => this.error.set(mensajeDeError(e)),
    });
    this.cargar();
  }

  private aplicarValidacionesDeTipo(): void {
    const esAjuste = this.form.controls.tipo.value === 'AJUSTE';
    const cantidad = this.form.controls.cantidad;
    const motivo = this.form.controls.motivo;
    cantidad.setValidators(
      esAjuste
        ? [Validators.required, Validators.pattern(/^-?[1-9]\d*$/)]
        : [Validators.required, Validators.pattern(/^[1-9]\d*$/)],
    );
    motivo.setValidators(
      esAjuste ? [Validators.required, Validators.maxLength(255)] : [Validators.maxLength(255)],
    );
    cantidad.updateValueAndValidity({ emitEvent: false });
    motivo.updateValueAndValidity({ emitEvent: false });
  }

  cargar(): void {
    const filtros: MovimientoFiltros = {
      productoId: this.filtroProductoId(),
      tipo: this.filtroTipo(),
      desde: this.filtroDesde(),
      hasta: this.filtroHasta(),
    };
    this.service.listar(filtros, this.pagina()).subscribe({
      next: (pagina) => this.movimientos.set(pagina),
      error: (e) => this.error.set(mensajeDeError(e)),
    });
  }

  onFiltroProducto(event: Event): void {
    const valor = (event.target as HTMLSelectElement).value;
    this.filtroProductoId.set(valor ? Number(valor) : null);
    this.pagina.set(0);
    this.cargar();
  }

  onFiltroTipo(event: Event): void {
    const valor = (event.target as HTMLSelectElement).value;
    this.filtroTipo.set(valor ? (valor as TipoMovimiento) : null);
    this.pagina.set(0);
    this.cargar();
  }

  onFiltroDesde(event: Event): void {
    const valor = (event.target as HTMLInputElement).value;
    this.filtroDesde.set(valor || null);
    this.pagina.set(0);
    this.cargar();
  }

  onFiltroHasta(event: Event): void {
    const valor = (event.target as HTMLInputElement).value;
    this.filtroHasta.set(valor || null);
    this.pagina.set(0);
    this.cargar();
  }

  irAPagina(numero: number): void {
    this.pagina.set(numero);
    this.cargar();
  }

  onBusquedaProducto(event: Event): void {
    this.busqueda$.next((event.target as HTMLInputElement).value);
  }

  private buscar(texto: string): void {
    const termino = texto.trim();
    if (!termino) {
      this.resultadosBusqueda.set([]);
      return;
    }
    this.productoService.listar({ q: termino, categoriaId: null, activo: true }, 0, 10).subscribe({
      next: (pagina) => {
        this.resultadosBusqueda.set(pagina.content);
        this.conocidos.update((mapa) => {
          const copia = new Map(mapa);
          for (const producto of pagina.content) {
            copia.set(producto.id, producto);
          }
          return copia;
        });
      },
      error: (e) => this.error.set(mensajeDeError(e)),
    });
  }

  opcionesFormulario(): ProductoResponse[] {
    const opciones = this.resultadosBusqueda();
    const id = this.form.controls.productoId.value;
    if (id === null) {
      return opciones;
    }
    const seleccionado = this.conocidos().get(id);
    if (seleccionado && !opciones.some((producto) => producto.id === id)) {
      return [seleccionado, ...opciones];
    }
    return opciones;
  }

  productoFormulario(): ProductoResponse | null {
    const id = this.form.controls.productoId.value;
    return id === null ? null : (this.conocidos().get(id) ?? null);
  }

  private preseleccionar(producto: ProductoResponse): void {
    this.form.controls.productoId.setValue(producto.id);
    this.conocidos.update((mapa) => {
      const copia = new Map(mapa);
      copia.set(producto.id, producto);
      return copia;
    });
  }

  errorProducto(): string | null {
    const control = this.form.controls.productoId;
    return control.touched && control.hasError('required') ? 'Debe elegir un producto' : null;
  }

  errorCantidad(): string | null {
    const control = this.form.controls.cantidad;
    if (!control.touched) {
      return null;
    }
    if (control.hasError('required')) {
      return 'La cantidad es obligatoria';
    }
    if (control.hasError('pattern')) {
      return this.form.controls.tipo.value === 'AJUSTE'
        ? 'La cantidad de un ajuste no puede ser 0'
        : 'La cantidad de una entrada debe ser un entero mayor a 0';
    }
    return null;
  }

  errorMotivo(): string | null {
    const control = this.form.controls.motivo;
    if (!control.touched) {
      return null;
    }
    if (control.hasError('required')) {
      return 'El motivo es obligatorio para un ajuste';
    }
    if (control.hasError('maxlength')) {
      return 'No puede superar 255 caracteres';
    }
    return null;
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    if (this.enviando()) {
      return;
    }
    this.enviando.set(true);
    this.error.set(null);
    this.exito.set(null);

    const valor = this.form.getRawValue();
    const request: MovimientoRequest = {
      productoId: valor.productoId!,
      tipo: valor.tipo,
      cantidad: valor.cantidad!,
      motivo: valor.motivo.trim() || null,
    };

    this.service.crear(request).subscribe({
      next: (creado) => {
        const etiqueta = creado.tipo === 'ENTRADA' ? 'Entrada registrada' : 'Ajuste registrado';
        this.exito.set(`${etiqueta} · Stock resultante de ${creado.sku}: ${creado.stockActual}`);
        this.enviando.set(false);
        this.reiniciarFormulario();
        this.cargar();
      },
      error: (e) => {
        this.enviando.set(false);
        this.error.set(mensajeDeError(e));
      },
    });
  }

  private reiniciarFormulario(): void {
    this.form.reset({
      productoId: null,
      tipo: 'ENTRADA',
      cantidad: null,
      motivo: '',
      busqueda: '',
    });
    this.resultadosBusqueda.set([]);
  }
}
