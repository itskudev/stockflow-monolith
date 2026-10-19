import { Component, input } from '@angular/core';

@Component({
  selector: 'app-mensaje',
  imports: [],
  templateUrl: './mensaje.html',
  styleUrl: './mensaje.css',
})
export class MensajeComponent {
  readonly tipo = input<'error' | 'exito' | 'info'>('info');
  readonly texto = input<string | null>(null);
}
