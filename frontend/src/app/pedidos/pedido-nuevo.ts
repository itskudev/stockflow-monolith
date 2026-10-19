import { DecimalPipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import {
  AbstractControl,
  FormArray,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { ClienteResponse } from '../clientes/cliente.model';
import { ClienteService } from '../clientes/cliente.service';
import { mensajeDeError } from '../core/models/error-api';
import { ProductoResponse } from '../productos/producto.model';
import { ProductoService } from '../productos/producto.service';
import { MensajeComponent } from '../shared/mensaje';
import { PedidoRequest } from './pedido.model';
import { PedidoService } from './pedido.service';

interface LineaForms {
  busqueda: FormControl<string>;
  productoId: FormControl<number | null>;
  cantidad: FormControl<number | null>;
}

function crearLinea(): FormGroup<LineaForms> {
  return new FormGroup({
    busqueda: new FormControl('', { nonNullable: true }),
    productoId: new FormControl<number | null>(null, { validators: [Validators.required] }),
    cantidad: new FormControl<number | null>(1, {
      validators: [Validators.required, Validators.min(1)],
    }),
  });
}

function sinProductoDuplicado(control: AbstractControl): ValidationErrors | null {
  const lineas = control as FormArray<FormGroup<LineaForms>>;
  const ids = lineas.controls
    .map((linea) => linea.controls.productoId.value)
    .filter((id): id is number => id !== null);
  return new Set(ids).size === ids.length ? null : { productoDuplicado: true };
}

@Component({
  selector: 'app-pedido-nuevo',
  imports: [ReactiveFormsModule, RouterLink, DecimalPipe, MensajeComponent],
  templateUrl: './pedido-nuevo.html',
  styleUrl: './pedido-nuevo.css',
})
export class PedidoNuevoComponent implements OnInit {
  private readonly service = inject(PedidoService);
  private readonly clienteService = inject(ClienteService);
  private readonly productoService = inject(ProductoService);
  private readonly router = inject(Router);
  private readonly busqueda$ = new Subject<{ indice: number; termino: string }>();
  private readonly conocidos = signal<Map<number, ProductoResponse>>(new Map());

  readonly clientes = signal<ClienteResponse[]>([]);
  readonly error = signal<string | null>(null);
  readonly enviando = signal(false);
  readonly resultados = signal<Record<number, ProductoResponse[]>>({});

  readonly form = new FormGroup({
    clienteId: new FormControl<number | null>(null, { validators: [Validators.required] }),
    observacion: new FormControl('', {
      nonNullable: true,
      validators: [Validators.maxLength(255)],
    }),
    lineas: new FormArray<FormGroup<LineaForms>>([crearLinea()], {
      validators: [sinProductoDuplicado],
    }),
  });

  constructor() {
    this.busqueda$
      .pipe(
        debounceTime(300),
        distinctUntilChanged((a, b) => a.indice === b.indice && a.termino === b.termino),
        takeUntilDestroyed(),
      )
      .subscribe(({ indice, termino }) => this.buscar(indice, termino));
  }

  ngOnInit(): void {
    this.clienteService.listar(null, 0, 1000).subscribe({
      next: (pagina) => this.clientes.set(pagina.content),
      error: (e) => this.error.set(mensajeDeError(e)),
    });
  }

  get lineas(): FormArray<FormGroup<LineaForms>> {
    return this.form.controls.lineas;
  }

  agregarLinea(): void {
    this.lineas.push(crearLinea());
  }

  quitarLinea(indice: number): void {
    if (this.lineas.length <= 1) {
      return;
    }
    this.lineas.removeAt(indice);
    const actualizado: Record<number, ProductoResponse[]> = {};
    for (const [clave, valor] of Object.entries(this.resultados())) {
      const posicion = Number(clave);
      actualizado[posicion > indice ? posicion - 1 : posicion] = valor;
    }
    this.resultados.set(actualizado);
  }

  onBusquedaProducto(indice: number, event: Event): void {
    const termino = (event.target as HTMLInputElement).value;
    this.busqueda$.next({ indice, termino });
  }

  buscar(indice: number, termino: string): void {
    const texto = termino.trim();
    if (!texto) {
      this.resultados.update((actual) => ({ ...actual, [indice]: [] }));
      return;
    }
    this.productoService.listar({ q: texto, categoriaId: null, activo: true }, 0, 10).subscribe({
      next: (pagina) => {
        this.resultados.update((actual) => ({ ...actual, [indice]: pagina.content }));
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

  opcionesLinea(indice: number): ProductoResponse[] {
    const opciones = this.resultados()[indice] ?? [];
    const seleccionado = this.productoDe(indice);
    if (seleccionado && !opciones.some((producto) => producto.id === seleccionado.id)) {
      return [seleccionado, ...opciones];
    }
    return opciones;
  }

  productoDe(indice: number): ProductoResponse | null {
    const id = this.lineas.at(indice).controls.productoId.value;
    return id === null ? null : (this.conocidos().get(id) ?? null);
  }

  subtotalLinea(indice: number): number | null {
    const producto = this.productoDe(indice);
    const cantidad = this.lineas.at(indice).controls.cantidad.value;
    return producto !== null && cantidad !== null ? producto.precio * cantidad : null;
  }

  total(): number {
    let suma = 0;
    for (let i = 0; i < this.lineas.length; i++) {
      suma += this.subtotalLinea(i) ?? 0;
    }
    return suma;
  }

  enOtraLinea(productoId: number, indice: number): boolean {
    return this.lineas.controls.some(
      (linea, i) => i !== indice && linea.controls.productoId.value === productoId,
    );
  }

  errorCliente(): string | null {
    const control = this.form.controls.clienteId;
    return control.touched && control.hasError('required') ? 'El cliente es obligatorio' : null;
  }

  errorObservacion(): string | null {
    const control = this.form.controls.observacion;
    if (!control.touched || !control.hasError('maxlength')) {
      return null;
    }
    return 'No puede superar 255 caracteres';
  }

  errorProducto(linea: FormGroup<LineaForms>): string | null {
    const control = linea.controls.productoId;
    return control.touched && control.hasError('required') ? 'Debe elegir un producto' : null;
  }

  errorCantidad(linea: FormGroup<LineaForms>): string | null {
    const control = linea.controls.cantidad;
    if (!control.touched) {
      return null;
    }
    if (control.hasError('required')) {
      return 'La cantidad es obligatoria';
    }
    if (control.hasError('min')) {
      return 'La cantidad debe ser al menos 1';
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

    const valor = this.form.getRawValue();
    const request: PedidoRequest = {
      clienteId: valor.clienteId!,
      observacion: valor.observacion.trim() || null,
      detalles: valor.lineas.map((linea) => ({
        productoId: linea.productoId!,
        cantidad: linea.cantidad!,
      })),
    };

    this.service.crear(request).subscribe({
      next: (pedido) => this.router.navigate(['/pedidos', pedido.id]),
      error: (e) => {
        this.enviando.set(false);
        this.error.set(mensajeDeError(e));
      },
    });
  }
}
