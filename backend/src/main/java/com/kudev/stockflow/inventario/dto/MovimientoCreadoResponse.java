package com.kudev.stockflow.inventario.dto;

import com.kudev.stockflow.inventario.TipoMovimiento;
import java.time.LocalDateTime;

public record MovimientoCreadoResponse(
        Long id,
        Long productoId,
        String sku,
        String productoNombre,
        TipoMovimiento tipo,
        Integer cantidad,
        String motivo,
        Long pedidoId,
        String usuarioNombre,
        LocalDateTime fecha,
        Integer stockActual) {
}
