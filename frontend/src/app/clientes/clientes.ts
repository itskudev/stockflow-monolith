import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { AuthService } from '../core/auth/auth.service';
import { mensajeDeError } from '../core/models/error-api';
import { Pagina } from '../core/models/pagina';
import { MensajeComponent } from '../shared/mensaje';
import { PaginadorComponent } from '../shared/paginador';
import { ClienteRequest, ClienteResponse } from './cliente.model';
import { ClienteService } from './cliente.service';

@Component({
  selector: 'app-clientes',
  imports: [ReactiveFormsModule, MensajeComponent, PaginadorComponent],
  templateUrl: './clientes.html',
  styleUrl: './clientes.css',
})
export class ClientesComponent implements OnInit {
  private readonly service = inject(ClienteService);
  private readonly auth = inject(AuthService);
  private readonly busqueda$ = new Subject<string>();

  readonly clientes = signal<Pagina<ClienteResponse> | null>(null);
  readonly error = signal<string | null>(null);
  readonly q = signal('');
  readonly pagina = signal(0);
  readonly modo = signal<'crear' | 'editar' | null>(null);
  readonly editando = signal<ClienteResponse | null>(null);
  readonly esAdmin = computed(() => this.auth.rol() === 'ADMIN');

  readonly form = new FormGroup({
    nombre: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(120)],
    }),
    documento: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(20)],
    }),
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.email, Validators.maxLength(120)],
    }),
    telefono: new FormControl('', {
      nonNullable: true,
      validators: [Validators.maxLength(20)],
    }),
    direccion: new FormControl('', {
      nonNullable: true,
      validators: [Validators.maxLength(255)],
    }),
  });

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
    this.cargar();
  }

  cargar(): void {
    this.service.listar(this.q() || null, this.pagina()).subscribe({
      next: (pagina) => this.clientes.set(pagina),
      error: (e) => this.error.set(mensajeDeError(e)),
    });
  }

  onBusqueda(event: Event): void {
    this.busqueda$.next((event.target as HTMLInputElement).value);
  }

  irAPagina(numero: number): void {
    this.pagina.set(numero);
    this.cargar();
  }

  nuevo(): void {
    this.error.set(null);
    this.editando.set(null);
    this.modo.set('crear');
    this.form.reset({ nombre: '', documento: '', email: '', telefono: '', direccion: '' });
  }

  editar(cliente: ClienteResponse): void {
    this.error.set(null);
    this.editando.set(cliente);
    this.modo.set('editar');
    this.form.setValue({
      nombre: cliente.nombre,
      documento: cliente.documento,
      email: cliente.email ?? '',
      telefono: cliente.telefono ?? '',
      direccion: cliente.direccion ?? '',
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
    const datos: ClienteRequest = {
      nombre: valor.nombre,
      documento: valor.documento,
      email: valor.email || null,
      telefono: valor.telefono || null,
      direccion: valor.direccion || null,
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

  eliminar(cliente: ClienteResponse): void {
    if (!confirm(`¿Eliminar el cliente "${cliente.nombre}"?`)) {
      return;
    }
    this.service.eliminar(cliente.id).subscribe({
      next: () => this.cargar(),
      error: (e) => this.error.set(mensajeDeError(e)),
    });
  }

  mostrarError(campo: 'nombre' | 'documento' | 'email' | 'telefono' | 'direccion'): string | null {
    const control = this.form.get(campo);
    if (!control || !control.touched) {
      return null;
    }
    if (control.hasError('required')) {
      return campo === 'documento' ? 'El documento es obligatorio' : 'El nombre es obligatorio';
    }
    if (control.hasError('email')) {
      return 'El email no tiene un formato válido';
    }
    if (control.hasError('maxlength')) {
      const maximo = control.getError('maxlength').requiredLength;
      return `No puede superar ${maximo} caracteres`;
    }
    return null;
  }
}
