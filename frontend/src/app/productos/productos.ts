import { DecimalPipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { CategoriaResponse } from '../categorias/categoria.model';
import { CategoriaService } from '../categorias/categoria.service';
import { AuthService } from '../core/auth/auth.service';
import { mensajeDeError } from '../core/models/error-api';
import { Pagina } from '../core/models/pagina';
import { MensajeComponent } from '../shared/mensaje';
import { PaginadorComponent } from '../shared/paginador';
import { ProductoFiltros, ProductoRequest, ProductoResponse } from './producto.model';
import { ProductoService } from './producto.service';

@Component({
  selector: 'app-productos',
  imports: [ReactiveFormsModule, DecimalPipe, MensajeComponent, PaginadorComponent],
  templateUrl: './productos.html',
  styleUrl: './productos.css',
})
export class ProductosComponent implements OnInit {
  private readonly service = inject(ProductoService);
  private readonly categoriaService = inject(CategoriaService);
  private readonly auth = inject(AuthService);
  private readonly busqueda$ = new Subject<string>();

  readonly productos = signal<Pagina<ProductoResponse> | null>(null);
  readonly categorias = signal<CategoriaResponse[]>([]);
  readonly error = signal<string | null>(null);
  readonly q = signal('');
  readonly categoriaId = signal<number | null>(null);
  readonly soloActivos = signal(true);
  readonly pagina = signal(0);
  readonly modo = signal<'crear' | 'editar' | null>(null);
  readonly editando = signal<ProductoResponse | null>(null);
  readonly esAdmin = computed(() => this.auth.rol() === 'ADMIN');

  readonly form = new FormGroup({
    sku: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(40)],
    }),
    nombre: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(120)],
    }),
    descripcion: new FormControl('', {
      nonNullable: true,
      validators: [Validators.maxLength(255)],
    }),
    precio: new FormControl<number | null>(null, {
      validators: [Validators.required, Validators.min(0)],
    }),
    stockMinimo: new FormControl<number | null>(null, {
      validators: [Validators.required, Validators.min(0), Validators.pattern(/^[0-9]+$/)],
    }),
    categoriaId: new FormControl<number | null>(null, {
      validators: [Validators.required],
    }),
  });

  private readonly etiquetasRequerido: Record<string, string> = {
    sku: 'El SKU es obligatorio',
    nombre: 'El nombre es obligatorio',
    precio: 'El precio es obligatorio',
    stockMinimo: 'El stock mínimo es obligatorio',
    categoriaId: 'La categoría es obligatoria',
  };

  constructor() {
    this.busqueda$
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe((valor) => {
        this.q.set(valor.trim());
        this.pagina.set(0);
        this.cargar();
      });
  }

  ngOnInit(): void {
    this.categoriaService.listar().subscribe({
      next: (lista) => this.categorias.set(lista),
      error: (e) => this.error.set(mensajeDeError(e)),
    });
    this.cargar();
  }

  cargar(): void {
    const filtros: ProductoFiltros = {
      q: this.q() || null,
      categoriaId: this.categoriaId(),
      activo: this.soloActivos(),
    };
    this.service.listar(filtros, this.pagina()).subscribe({
      next: (pagina) => this.productos.set(pagina),
      error: (e) => this.error.set(mensajeDeError(e)),
    });
  }

  onBusqueda(event: Event): void {
    this.busqueda$.next((event.target as HTMLInputElement).value);
  }

  onCategoria(event: Event): void {
    const valor = (event.target as HTMLSelectElement).value;
    this.categoriaId.set(valor ? Number(valor) : null);
    this.pagina.set(0);
    this.cargar();
  }

  onActivo(event: Event): void {
    this.soloActivos.set((event.target as HTMLSelectElement).value === 'true');
    this.pagina.set(0);
    this.cargar();
  }

  irAPagina(numero: number): void {
    this.pagina.set(numero);
    this.cargar();
  }

  esStockBajo(producto: ProductoResponse): boolean {
    return producto.stockActual <= producto.stockMinimo;
  }

  nuevo(): void {
    this.error.set(null);
    this.editando.set(null);
    this.modo.set('crear');
    this.form.reset({
      sku: '',
      nombre: '',
      descripcion: '',
      precio: null,
      stockMinimo: null,
      categoriaId: null,
    });
  }

  editar(producto: ProductoResponse): void {
    this.error.set(null);
    this.editando.set(producto);
    this.modo.set('editar');
    this.form.setValue({
      sku: producto.sku,
      nombre: producto.nombre,
      descripcion: producto.descripcion ?? '',
      precio: producto.precio,
      stockMinimo: producto.stockMinimo,
      categoriaId: producto.categoriaId,
    });
  }

  cerrar(): void {
    this.modo.set(null);
    this.error.set(null);
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const valor = this.form.getRawValue();
    const datos: ProductoRequest = {
      sku: valor.sku,
      nombre: valor.nombre,
      descripcion: valor.descripcion,
      precio: valor.precio!,
      stockMinimo: valor.stockMinimo!,
      categoriaId: valor.categoriaId!,
    };
    const enEdicion = this.editando();
    const peticion = enEdicion
      ? this.service.actualizar(enEdicion.id, datos)
      : this.service.crear(datos);

    peticion.subscribe({
      next: () => {
        this.modo.set(null);
        this.editando.set(null);
        this.cargar();
      },
      error: (e) => this.error.set(mensajeDeError(e)),
    });
  }

  desactivar(producto: ProductoResponse): void {
    if (!confirm(`¿Desactivar el producto "${producto.nombre}"?`)) {
      return;
    }
    this.service.eliminar(producto.id).subscribe({
      next: () => this.cargar(),
      error: (e) => this.error.set(mensajeDeError(e)),
    });
  }

  mostrarError(
    campo: 'sku' | 'nombre' | 'descripcion' | 'precio' | 'stockMinimo' | 'categoriaId',
  ): string | null {
    const control = this.form.get(campo);
    if (!control || !control.touched) {
      return null;
    }
    if (control.hasError('required')) {
      return this.etiquetasRequerido[campo] ?? null;
    }
    if (control.hasError('maxlength')) {
      const maximo = control.getError('maxlength').requiredLength;
      return `No puede superar ${maximo} caracteres`;
    }
    if (control.hasError('min')) {
      return campo === 'precio'
        ? 'El precio no puede ser negativo'
        : 'El stock mínimo no puede ser negativo';
    }
    if (control.hasError('pattern')) {
      return 'El stock mínimo debe ser un número entero';
    }
    return null;
  }
}
