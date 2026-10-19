import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

export interface EnlaceMenu {
  etiqueta: string;
  ruta: string;
}

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './shell.html',
  styleUrl: './shell.css',
})
export class ShellComponent {
  protected readonly enlaces = signal<EnlaceMenu[]>([
    { etiqueta: 'Inicio', ruta: '/' },
  ]);
}
