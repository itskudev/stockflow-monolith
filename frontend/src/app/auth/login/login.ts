import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { ErrorApi } from '../../core/models/error-api';
import { MensajeComponent } from '../../shared/mensaje';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, MensajeComponent],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class LoginComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly form = new FormGroup({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  readonly cargando = signal(false);
  readonly errorGeneral = signal<string | null>(null);

  ngOnInit(): void {
    if (this.auth.isLoggedIn()) {
      this.router.navigate(['/']);
    }
  }

  enviar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.cargando.set(true);
    this.errorGeneral.set(null);

    this.auth.login(this.form.getRawValue()).subscribe({
      next: () => {
        this.cargando.set(false);
        this.router.navigate(['/']);
      },
      error: (error: unknown) => {
        this.cargando.set(false);
        this.errorGeneral.set(this.mensajeDe(error));
      },
    });
  }

  mostrarError(campo: 'email' | 'password'): string | null {
    const control = this.form.get(campo);
    if (!control || !control.touched) {
      return null;
    }
    if (control.hasError('required')) {
      return campo === 'email' ? 'El email es obligatorio' : 'La contraseña es obligatoria';
    }
    if (control.hasError('email')) {
      return 'Ingresa un email válido';
    }
    return null;
  }

  private mensajeDe(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      const cuerpo = error.error as Partial<ErrorApi> | null;
      if (cuerpo && typeof cuerpo === 'object' && cuerpo.message) {
        return cuerpo.message;
      }
      if (error.status === 0) {
        return 'No se pudo conectar con el servidor';
      }
    }
    return 'No se pudo iniciar sesión';
  }
}
