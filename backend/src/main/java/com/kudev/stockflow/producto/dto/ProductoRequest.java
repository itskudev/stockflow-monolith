package com.kudev.stockflow.producto.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public record ProductoRequest(
        @NotBlank(message = "El SKU es obligatorio") @Size(max = 40, message = "El SKU no puede superar 40 caracteres") String sku,
        @NotBlank(message = "El nombre es obligatorio") @Size(max = 120, message = "El nombre no puede superar 120 caracteres") String nombre,
        @Size(max = 255, message = "La descripción no puede superar 255 caracteres") String descripcion,
        @NotNull(message = "El precio es obligatorio") @DecimalMin(value = "0", message = "El precio no puede ser negativo") BigDecimal precio,
        @NotNull(message = "El stock mínimo es obligatorio") @Min(value = 0, message = "El stock mínimo no puede ser negativo") Integer stockMinimo,
        @NotNull(message = "La categoría es obligatoria") Long categoriaId) {
}
