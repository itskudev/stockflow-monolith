package com.kudev.stockflow.pedido.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;

public record PedidoRequest(
        @NotNull(message = "El cliente es obligatorio") Long clienteId,
        @Size(max = 255, message = "La observación no puede superar 255 caracteres") String observacion,
        @NotNull(message = "Los detalles son obligatorios") @Valid List<DetallePedidoRequest> detalles) {
}
