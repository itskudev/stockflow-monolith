package com.kudev.stockflow.inventario;

import com.kudev.stockflow.inventario.dto.MovimientoResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface InventarioMapper {

    @Mapping(target = "productoId", source = "movimiento.producto.id")
    @Mapping(target = "sku", source = "movimiento.producto.sku")
    @Mapping(target = "productoNombre", source = "movimiento.producto.nombre")
    @Mapping(target = "pedidoId", source = "movimiento.pedido.id")
    @Mapping(target = "usuarioNombre", source = "movimiento.usuario.nombre")
    MovimientoResponse toResponse(MovimientoInventario movimiento);
}
