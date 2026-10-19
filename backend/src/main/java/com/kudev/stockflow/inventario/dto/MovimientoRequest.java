package com.kudev.stockflow.inventario.dto;

import com.kudev.stockflow.inventario.TipoMovimiento;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record MovimientoRequest(
        @NotNull(message = "El producto es obligatorio") Long productoId,
        @NotNull(message = "El tipo es obligatorio") TipoMovimiento tipo,
        @NotNull(message = "La cantidad es obligatoria") Integer cantidad,
        @Size(max = 255, message = "El motivo no puede superar 255 caracteres") String motivo) {
}
