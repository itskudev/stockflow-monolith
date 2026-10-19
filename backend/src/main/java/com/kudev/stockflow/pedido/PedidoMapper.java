package com.kudev.stockflow.pedido;

import com.kudev.stockflow.cliente.Cliente;
import com.kudev.stockflow.pedido.dto.ClienteResumenResponse;
import com.kudev.stockflow.pedido.dto.DetallePedidoResponse;
import com.kudev.stockflow.pedido.dto.PedidoResumenResponse;
import com.kudev.stockflow.pedido.dto.PedidoResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface PedidoMapper {

    @Mapping(target = "cliente", source = "cliente")
    @Mapping(target = "vendedor", source = "usuario.nombre")
    @Mapping(target = "detalles", source = "detalles")
    PedidoResponse toResponse(Pedido pedido);

    ClienteResumenResponse toClienteResumen(Cliente cliente);

    @Mapping(target = "productoId", source = "producto.id")
    @Mapping(target = "sku", source = "producto.sku")
    @Mapping(target = "productoNombre", source = "producto.nombre")
    DetallePedidoResponse toDetalleResponse(DetallePedido detalle);

    @Mapping(target = "clienteNombre", source = "cliente.nombre")
    PedidoResumenResponse toResumen(Pedido pedido);
}
