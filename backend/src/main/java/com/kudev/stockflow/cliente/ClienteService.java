package com.kudev.stockflow.cliente;

import com.kudev.stockflow.cliente.dto.ClienteRequest;
import com.kudev.stockflow.cliente.dto.ClienteResponse;
import com.kudev.stockflow.cliente.repository.ClienteRepository;
import com.kudev.stockflow.common.exception.ConflictoException;
import com.kudev.stockflow.common.exception.RecursoNoEncontradoException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ClienteService {

    private final ClienteRepository clienteRepository;
    private final ClienteMapper clienteMapper;

    public ClienteService(ClienteRepository clienteRepository, ClienteMapper clienteMapper) {
        this.clienteRepository = clienteRepository;
        this.clienteMapper = clienteMapper;
    }

    @Transactional
    public ClienteResponse crear(ClienteRequest request) {
        validarDocumentoDuplicado(request.documento(), null);

        Cliente cliente = new Cliente();
        cliente.setNombre(request.nombre());
        cliente.setDocumento(request.documento());
        cliente.setEmail(request.email());
        cliente.setTelefono(request.telefono());
        cliente.setDireccion(request.direccion());

        return clienteMapper.toResponse(clienteRepository.save(cliente));
    }

    @Transactional(readOnly = true)
    public Page<ClienteResponse> listar(String q, Pageable pageable) {
        String patron = armarPatron(q);
        return clienteRepository.buscar(patron, pageable).map(clienteMapper::toResponse);
    }

    @Transactional(readOnly = true)
    public ClienteResponse obtener(Long id) {
        return clienteMapper.toResponse(buscar(id));
    }

    @Transactional
    public ClienteResponse actualizar(Long id, ClienteRequest request) {
        Cliente cliente = buscar(id);
        validarDocumentoDuplicado(request.documento(), id);
        cliente.setNombre(request.nombre());
        cliente.setDocumento(request.documento());
        cliente.setEmail(request.email());
        cliente.setTelefono(request.telefono());
        cliente.setDireccion(request.direccion());

        return clienteMapper.toResponse(clienteRepository.save(cliente));
    }

    @Transactional
    public void eliminar(Long id) {
        Cliente cliente = buscar(id);
        if (clienteRepository.existePedido(id)) {
            throw new ConflictoException("No se puede eliminar un cliente que tiene pedidos");
        }
        clienteRepository.delete(cliente);
    }

    private String armarPatron(String q) {
        return (q == null || q.isBlank()) ? "%" : "%" + q.trim().toLowerCase() + "%";
    }

    private Cliente buscar(Long id) {
        return clienteRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Cliente no encontrado con id " + id));
    }

    private void validarDocumentoDuplicado(String documento, Long idExcluido) {
        boolean duplicado = clienteRepository.findByDocumento(documento)
                .filter(existente -> idExcluido == null || !existente.getId().equals(idExcluido))
                .isPresent();
        if (duplicado) {
            throw new ConflictoException("Ya existe un cliente con ese documento");
        }
    }
}
