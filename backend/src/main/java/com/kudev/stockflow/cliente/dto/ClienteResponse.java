package com.kudev.stockflow.cliente.dto;

public record ClienteResponse(
        Long id,
        String nombre,
        String documento,
        String email,
        String telefono,
        String direccion) {
}
