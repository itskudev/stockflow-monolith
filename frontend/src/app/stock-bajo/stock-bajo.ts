import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { mensajeDeError } from '../core/models/error-api';
import { ProductoResponse } from '../productos/producto.model';
import { ProductoService } from '../productos/producto.service';
import { MensajeComponent } from '../shared/mensaje';

@Component({
  selector: 'app-stock-bajo',
  imports: [MensajeComponent],
  templateUrl: './stock-bajo.html',
  styleUrl: './stock-bajo.css',
})
export class StockBajoComponent implements OnInit {
  private readonly productoService = inject(ProductoService);
  private readonly router = inject(Router);

  readonly productos = signal<ProductoResponse[] | null>(null);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.productoService.stockBajo().subscribe({
      next: (lista) => this.productos.set(lista),
      error: (e) => this.error.set(mensajeDeError(e)),
    });
  }

  registrarEntrada(producto: ProductoResponse): void {
    this.router.navigate(['/movimientos'], { queryParams: { productoId: producto.id } });
  }
}
