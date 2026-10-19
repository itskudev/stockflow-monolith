package com.kudev.stockflow.usuario.dto;

import com.kudev.stockflow.usuario.RolNombre;
import java.time.LocalDateTime;

public record UsuarioResponse(
        Long id,
        String nombre,
        String email,
        Boolean activo,
        RolNombre rol,
        LocalDateTime fechaCreacion) {
}
