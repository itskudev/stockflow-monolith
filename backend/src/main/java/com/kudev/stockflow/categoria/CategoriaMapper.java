package com.kudev.stockflow.categoria;

import com.kudev.stockflow.categoria.dto.CategoriaResponse;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface CategoriaMapper {

    CategoriaResponse toResponse(Categoria categoria);
}
