package com.kudev.stockflow.auth.dto;

import com.kudev.stockflow.usuario.RolNombre;

public record LoginResponse(
        String token,
        String tipo,
        String email,
        String nombre,
        RolNombre rol) {
}
