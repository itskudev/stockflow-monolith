package com.kudev.stockflow.usuario;

import com.kudev.stockflow.usuario.dto.UsuarioResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UsuarioMapper {

    @Mapping(target = "rol", source = "rol.nombre")
    UsuarioResponse toResponse(Usuario usuario);
}
