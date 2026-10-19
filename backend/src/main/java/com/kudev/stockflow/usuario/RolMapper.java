package com.kudev.stockflow.usuario;

import com.kudev.stockflow.usuario.dto.RolResponse;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface RolMapper {

    RolResponse toResponse(Rol rol);
}
