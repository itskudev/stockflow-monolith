package com.kudev.stockflow.cliente.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ClienteRequest(
        @NotBlank(message = "El nombre es obligatorio") @Size(max = 120, message = "El nombre no puede superar 120 caracteres") String nombre,
        @NotBlank(message = "El documento es obligatorio") @Size(max = 20, message = "El documento no puede superar 20 caracteres") String documento,
        @Email(message = "El email no tiene un formato válido") @Size(max = 120, message = "El email no puede superar 120 caracteres") String email,
        @Size(max = 20, message = "El teléfono no puede superar 20 caracteres") String telefono,
        @Size(max = 255, message = "La dirección no puede superar 255 caracteres") String direccion) {
}
