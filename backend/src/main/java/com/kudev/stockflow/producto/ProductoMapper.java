package com.kudev.stockflow.producto;

import com.kudev.stockflow.producto.dto.ProductoResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ProductoMapper {

    @Mapping(target = "categoriaId", source = "categoria.id")
    @Mapping(target = "categoriaNombre", source = "categoria.nombre")
    ProductoResponse toResponse(Producto producto);
}
