package com.kudev.stockflow.cliente;

import com.kudev.stockflow.cliente.dto.ClienteResponse;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ClienteMapper {

    ClienteResponse toResponse(Cliente cliente);
}
