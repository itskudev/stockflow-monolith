package com.kudev.stockflow.producto.dto;

import java.math.BigDecimal;

public record ProductoResponse(
        Long id,
        String sku,
        String nombre,
        String descripcion,
        BigDecimal precio,
        Integer stockActual,
        Integer stockMinimo,
        Boolean activo,
        Long categoriaId,
        String categoriaNombre) {
}
