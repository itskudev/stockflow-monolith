package com.kudev.stockflow.pedido;

import com.kudev.stockflow.cliente.Cliente;
import com.kudev.stockflow.cliente.repository.ClienteRepository;
import com.kudev.stockflow.common.exception.ConflictoException;
import com.kudev.stockflow.common.exception.RecursoNoEncontradoException;
import com.kudev.stockflow.common.exception.SolicitudInvalidaException;
import com.kudev.stockflow.inventario.InventarioService;
import com.kudev.stockflow.pedido.dto.DetallePedidoRequest;
import com.kudev.stockflow.pedido.dto.EstadoPedidoRequest;
import com.kudev.stockflow.pedido.dto.PedidoRequest;
import com.kudev.stockflow.pedido.dto.PedidoResumenResponse;
import com.kudev.stockflow.pedido.dto.PedidoResponse;
import com.kudev.stockflow.pedido.repository.PedidoRepository;
import com.kudev.stockflow.producto.Producto;
import com.kudev.stockflow.producto.repository.ProductoRepository;
import com.kudev.stockflow.usuario.Usuario;
import com.kudev.stockflow.usuario.repository.UsuarioRepository;
import java.math.BigDecimal;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PedidoService {

    private final PedidoRepository pedidoRepository;
    private final ClienteRepository clienteRepository;
    private final ProductoRepository productoRepository;
    private final UsuarioRepository usuarioRepository;
    private final InventarioService inventarioService;
    private final PedidoMapper pedidoMapper;

    public PedidoService(PedidoRepository pedidoRepository, ClienteRepository clienteRepository,
            ProductoRepository productoRepository, UsuarioRepository usuarioRepository,
            InventarioService inventarioService, PedidoMapper pedidoMapper) {
        this.pedidoRepository = pedidoRepository;
        this.clienteRepository = clienteRepository;
        this.productoRepository = productoRepository;
        this.usuarioRepository = usuarioRepository;
        this.inventarioService = inventarioService;
        this.pedidoMapper = pedidoMapper;
    }

    @Transactional
    public PedidoResponse crear(PedidoRequest request) {
        if (request.detalles().isEmpty()) {
            throw new SolicitudInvalidaException("El pedido debe tener al menos un detalle");
        }
        Cliente cliente = buscarCliente(request.clienteId());
        Usuario usuario = usuarioAutenticado();
        validarProductosNoRepetidos(request.detalles());

        Pedido pedido = new Pedido();
        pedido.setCliente(cliente);
        pedido.setUsuario(usuario);
        pedido.setObservacion(request.observacion());

        BigDecimal total = BigDecimal.ZERO;
        List<DetallePedidoRequest> detallesOrdenados = request.detalles().stream()
                .sorted(Comparator.comparing(DetallePedidoRequest::productoId))
                .toList();
        for (DetallePedidoRequest detalleReq : detallesOrdenados) {
            Producto producto = buscarProductoConBloqueo(detalleReq.productoId());
            if (!producto.isActivo()) {
                throw new ConflictoException(
                        "No se puede agregar el producto inactivo " + producto.getNombre());
            }
            DetallePedido detalle = new DetallePedido();
            detalle.setProducto(producto);
            detalle.setCantidad(detalleReq.cantidad());
            detalle.setPrecioUnitario(producto.getPrecio());
            BigDecimal subtotal = producto.getPrecio().multiply(BigDecimal.valueOf(detalleReq.cantidad()));
            detalle.setSubtotal(subtotal);
            pedido.addDetalle(detalle);
            total = total.add(subtotal);
        }
        pedido.setTotal(total);

        Pedido guardado = pedidoRepository.saveAndFlush(pedido);

        for (DetallePedido detalle : guardado.getDetalles()) {
            inventarioService.registrarSalida(detalle.getProducto(), detalle.getCantidad(), guardado, usuario,
                    "Pedido #" + guardado.getId());
        }

        return pedidoMapper.toResponse(guardado);
    }

    @Transactional(readOnly = true)
    public Page<PedidoResumenResponse> listar(EstadoPedido estado, Long clienteId, Pageable pageable) {
        return pedidoRepository.buscar(estado, clienteId, pageable).map(pedidoMapper::toResumen);
    }

    @Transactional(readOnly = true)
    public PedidoResponse obtener(Long id) {
        return pedidoMapper.toResponse(buscar(id));
    }

    @Transactional
    public PedidoResponse cambiarEstado(Long id, EstadoPedidoRequest request) {
        Pedido pedido = pedidoRepository.findByIdConBloqueo(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Pedido no encontrado con id " + id));
        EstadoPedido nuevoEstado = request.estado();

        if (pedido.getEstado() != EstadoPedido.PENDIENTE) {
            throw new ConflictoException("Solo se puede modificar un pedido PENDIENTE (estado actual: "
                    + pedido.getEstado() + ")");
        }
        if (nuevoEstado == EstadoPedido.PENDIENTE) {
            throw new ConflictoException("El pedido ya está PENDIENTE");
        }

        pedido.setEstado(nuevoEstado);
        Pedido completo = pedidoRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Pedido no encontrado con id " + id));

        if (nuevoEstado == EstadoPedido.CANCELADO) {
            Usuario usuario = usuarioAutenticado();
            List<DetallePedido> detallesOrdenados = completo.getDetalles().stream()
                    .sorted(Comparator.comparing(detalle -> detalle.getProducto().getId()))
                    .toList();
            for (DetallePedido detalle : detallesOrdenados) {
                Producto producto = buscarProductoConBloqueo(detalle.getProducto().getId());
                inventarioService.registrarEntrada(producto, detalle.getCantidad(), completo, usuario,
                        "Cancelación pedido #" + completo.getId());
            }
        }

        return pedidoMapper.toResponse(pedidoRepository.save(completo));
    }

    private Pedido buscar(Long id) {
        return pedidoRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Pedido no encontrado con id " + id));
    }

    private Cliente buscarCliente(Long id) {
        return clienteRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Cliente no encontrado con id " + id));
    }

    private Producto buscarProductoConBloqueo(Long id) {
        return productoRepository.findByIdConBloqueo(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Producto no encontrado con id " + id));
    }

    private Usuario usuarioAutenticado() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null) {
            throw new RecursoNoEncontradoException("Usuario autenticado no encontrado");
        }
        return usuarioRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario autenticado no encontrado"));
    }

    private void validarProductosNoRepetidos(List<DetallePedidoRequest> detalles) {
        Set<Long> vistos = new HashSet<>();
        for (DetallePedidoRequest detalle : detalles) {
            if (!vistos.add(detalle.productoId())) {
                throw new SolicitudInvalidaException(
                        "El producto con id " + detalle.productoId() + " está repetido en los detalles");
            }
        }
    }
}
