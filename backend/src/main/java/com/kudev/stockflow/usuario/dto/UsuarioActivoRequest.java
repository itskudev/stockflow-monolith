package com.kudev.stockflow.usuario.dto;

import jakarta.validation.constraints.NotNull;

public record UsuarioActivoRequest(
        @NotNull(message = "El campo activo es obligatorio") Boolean activo) {
}
