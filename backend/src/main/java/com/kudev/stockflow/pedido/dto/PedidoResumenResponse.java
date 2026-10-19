package com.kudev.stockflow.pedido.dto;

import com.kudev.stockflow.pedido.EstadoPedido;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public record PedidoResumenResponse(
        Long id,
        String clienteNombre,
        EstadoPedido estado,
        BigDecimal total,
        LocalDateTime fechaCreacion) {
}
