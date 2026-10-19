package com.kudev.stockflow.pedido.dto;

import java.math.BigDecimal;

public record DetallePedidoResponse(
        Long productoId,
        String sku,
        String productoNombre,
        Integer cantidad,
        BigDecimal precioUnitario,
        BigDecimal subtotal) {
}
