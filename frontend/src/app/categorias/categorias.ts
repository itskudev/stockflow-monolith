import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../core/auth/auth.service';
import { mensajeDeError } from '../core/models/error-api';
import { MensajeComponent } from '../shared/mensaje';
import { CategoriaRequest, CategoriaResponse } from './categoria.model';
import { CategoriaService } from './categoria.service';

@Component({
  selector: 'app-categorias',
  imports: [ReactiveFormsModule, MensajeComponent],
  templateUrl: './categorias.html',
  styleUrl: './categorias.css',
})
export class CategoriasComponent implements OnInit {
  private readonly service = inject(CategoriaService);
  private readonly auth = inject(AuthService);

  readonly categorias = signal<CategoriaResponse[] | null>(null);
  readonly error = signal<string | null>(null);
  readonly modo = signal<'crear' | 'editar' | null>(null);
  readonly editandoId = signal<number | null>(null);
  readonly esAdmin = computed(() => this.auth.rol() === 'ADMIN');

  readonly form = new FormGroup({
    nombre: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(80)],
    }),
    descripcion: new FormControl('', {
      nonNullable: true,
      validators: [Validators.maxLength(255)],
    }),
  });

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.service.listar().subscribe({
      next: (lista) => this.categorias.set(lista),
      error: (e) => this.error.set(mensajeDeError(e)),
    });
  }

  nueva(): void {
    this.error.set(null);
    this.editandoId.set(null);
    this.modo.set('crear');
    this.form.reset({ nombre: '', descripcion: '' });
  }

  editar(categoria: CategoriaResponse): void {
    this.error.set(null);
    this.editandoId.set(categoria.id);
    this.modo.set('editar');
    this.form.setValue({
      nombre: categoria.nombre,
      descripcion: categoria.descripcion ?? '',
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

    const datos: CategoriaRequest = this.form.getRawValue();
    const id = this.editandoId();
    const peticion = id !== null ? this.service.actualizar(id, datos) : this.service.crear(datos);

    peticion.subscribe({
      next: () => {
        this.modo.set(null);
        this.editandoId.set(null);
        this.cargar();
      },
      error: (e) => this.error.set(mensajeDeError(e)),
    });
  }

  eliminar(categoria: CategoriaResponse): void {
    if (!confirm(`¿Eliminar la categoría "${categoria.nombre}"?`)) {
      return;
    }
    this.service.eliminar(categoria.id).subscribe({
      next: () => this.cargar(),
      error: (e) => this.error.set(mensajeDeError(e)),
    });
  }

  mostrarError(campo: 'nombre' | 'descripcion'): string | null {
    const control = this.form.get(campo);
    if (!control || !control.touched) {
      return null;
    }
    if (control.hasError('required')) {
      return 'El nombre es obligatorio';
    }
    if (control.hasError('maxlength')) {
      const maximo = control.getError('maxlength').requiredLength;
      return `No puede superar ${maximo} caracteres`;
    }
    return null;
  }
}
