package com.kudev.stockflow.pedido.dto;

import com.kudev.stockflow.pedido.EstadoPedido;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record PedidoResponse(
        Long id,
        ClienteResumenResponse cliente,
        String vendedor,
        EstadoPedido estado,
        BigDecimal total,
        String observacion,
        LocalDateTime fechaCreacion,
        List<DetallePedidoResponse> detalles) {
}
