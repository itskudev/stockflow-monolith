import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../core/auth/auth.service';
import { mensajeDeError } from '../core/models/error-api';
import { Pagina } from '../core/models/pagina';
import { MensajeComponent } from '../shared/mensaje';
import { PaginadorComponent } from '../shared/paginador';
import {
  RolResponse,
  UsuarioCreateRequest,
  UsuarioResponse,
  UsuarioUpdateRequest,
} from './usuario.model';
import { UsuarioService } from './usuario.service';

@Component({
  selector: 'app-usuarios',
  imports: [ReactiveFormsModule, DatePipe, MensajeComponent, PaginadorComponent],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.css',
})
export class UsuariosComponent implements OnInit {
  private readonly service = inject(UsuarioService);
  private readonly auth = inject(AuthService);

  readonly usuarios = signal<Pagina<UsuarioResponse> | null>(null);
  readonly roles = signal<RolResponse[]>([]);
  readonly error = signal<string | null>(null);
  readonly pagina = signal(0);
  readonly modo = signal<'crear' | 'editar' | null>(null);
  readonly editando = signal<UsuarioResponse | null>(null);
  readonly enviando = signal(false);

  readonly form = new FormGroup({
    nombre: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(100)],
    }),
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email, Validators.maxLength(120)],
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(8)],
    }),
    rolId: new FormControl<number | null>(null, { validators: [Validators.required] }),
  });

  ngOnInit(): void {
    this.service.roles().subscribe({
      next: (lista) => this.roles.set(lista),
      error: (e) => this.error.set(mensajeDeError(e)),
    });
    this.cargar();
  }

  cargar(): void {
    this.service.listar(this.pagina()).subscribe({
      next: (pagina) => this.usuarios.set(pagina),
      error: (e) => this.error.set(mensajeDeError(e)),
    });
  }

  irAPagina(numero: number): void {
    this.pagina.set(numero);
    this.cargar();
  }

  nuevo(): void {
    this.error.set(null);
    this.editando.set(null);
    this.modo.set('crear');
    this.form.controls.password.setValidators([Validators.required, Validators.minLength(8)]);
    this.form.reset({ nombre: '', email: '', password: '', rolId: null });
  }

  editar(usuario: UsuarioResponse): void {
    this.error.set(null);
    this.editando.set(usuario);
    this.modo.set('editar');
    this.form.controls.password.clearValidators();
    this.form.reset({
      nombre: usuario.nombre,
      email: usuario.email,
      password: '',
      rolId: this.roles().find((rol) => rol.nombre === usuario.rol)?.id ?? null,
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
    if (this.enviando()) {
      return;
    }
    this.enviando.set(true);
    this.error.set(null);

    const valor = this.form.getRawValue();
    const enEdicion = this.editando();
    const peticion = enEdicion
      ? this.service.actualizar(enEdicion.id, {
          nombre: valor.nombre,
          email: valor.email,
          rolId: valor.rolId!,
        })
      : this.service.crear({
          nombre: valor.nombre,
          email: valor.email,
          password: valor.password,
          rolId: valor.rolId!,
        });

    peticion.subscribe({
      next: () => {
        this.modo.set(null);
        this.editando.set(null);
        this.enviando.set(false);
        this.cargar();
      },
      error: (e) => {
        this.enviando.set(false);
        this.error.set(mensajeDeError(e));
      },
    });
  }

  cambiarActivo(usuario: UsuarioResponse): void {
    const activar = !usuario.activo;
    const texto = activar
      ? `¿Activar al usuario "${usuario.nombre}"?`
      : `¿Desactivar al usuario "${usuario.nombre}"?`;
    if (!confirm(texto)) {
      return;
    }
    this.error.set(null);
    this.service.cambiarActivo(usuario.id, activar).subscribe({
      next: () => this.cargar(),
      error: (e) => this.error.set(mensajeDeError(e)),
    });
  }

  esPropiaFila(usuario: UsuarioResponse): boolean {
    return this.auth.sesion()?.email === usuario.email;
  }

  mostrarError(campo: 'nombre' | 'email' | 'password' | 'rolId'): string | null {
    const control = this.form.get(campo);
    if (!control || !control.touched) {
      return null;
    }
    if (control.hasError('required')) {
      const etiquetas: Record<string, string> = {
        nombre: 'El nombre es obligatorio',
        email: 'El email es obligatorio',
        password: 'La contraseña es obligatoria',
        rolId: 'El rol es obligatorio',
      };
      return etiquetas[campo] ?? null;
    }
    if (control.hasError('email')) {
      return 'El email no tiene un formato válido';
    }
    if (control.hasError('minlength')) {
      const minimo = control.getError('minlength').requiredLength;
      return `La contraseña debe tener al menos ${minimo} caracteres`;
    }
    if (control.hasError('maxlength')) {
      const maximo = control.getError('maxlength').requiredLength;
      return `No puede superar ${maximo} caracteres`;
    }
    return null;
  }
}
