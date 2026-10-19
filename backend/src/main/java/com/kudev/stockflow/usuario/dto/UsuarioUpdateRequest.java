package com.kudev.stockflow.usuario.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record UsuarioUpdateRequest(
        @NotBlank(message = "El nombre es obligatorio") @Size(max = 100, message = "El nombre no puede superar 100 caracteres") String nombre,
        @NotBlank(message = "El email es obligatorio") @Email(message = "El email no tiene un formato válido") String email,
        @NotNull(message = "El rol es obligatorio") Long rolId) {
}
