package com.kudev.stockflow.pedido.dto;

import com.kudev.stockflow.pedido.EstadoPedido;
import jakarta.validation.constraints.NotNull;

public record EstadoPedidoRequest(
        @NotNull(message = "El estado es obligatorio") EstadoPedido estado) {
}
