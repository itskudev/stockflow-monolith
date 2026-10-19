package com.kudev.stockflow.inventario;

import com.kudev.stockflow.common.exception.ConflictoException;
import com.kudev.stockflow.common.exception.RecursoNoEncontradoException;
import com.kudev.stockflow.common.exception.SolicitudInvalidaException;
import com.kudev.stockflow.inventario.dto.MovimientoCreadoResponse;
import com.kudev.stockflow.inventario.dto.MovimientoRequest;
import com.kudev.stockflow.inventario.dto.MovimientoResponse;
import com.kudev.stockflow.inventario.repository.MovimientoInventarioRepository;
import com.kudev.stockflow.pedido.Pedido;
import com.kudev.stockflow.producto.Producto;
import com.kudev.stockflow.producto.repository.ProductoRepository;
import com.kudev.stockflow.usuario.Usuario;
import java.time.LocalDateTime;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class InventarioService {

    private final MovimientoInventarioRepository movimientoRepository;
    private final ProductoRepository productoRepository;
    private final InventarioMapper inventarioMapper;

    public InventarioService(MovimientoInventarioRepository movimientoRepository,
            ProductoRepository productoRepository, InventarioMapper inventarioMapper) {
        this.movimientoRepository = movimientoRepository;
        this.productoRepository = productoRepository;
        this.inventarioMapper = inventarioMapper;
    }

    @Transactional
    public void registrarSalida(Producto producto, int cantidad, Pedido pedido, Usuario usuario, String motivo) {
        aplicarStockYGuardar(producto, TipoMovimiento.SALIDA, cantidad, pedido, usuario, motivo);
    }

    @Transactional
    public void registrarEntrada(Producto producto, int cantidad, Pedido pedido, Usuario usuario, String motivo) {
        aplicarStockYGuardar(producto, TipoMovimiento.ENTRADA, cantidad, pedido, usuario, motivo);
    }

    @Transactional
    public MovimientoCreadoResponse registrarMovimientoManual(MovimientoRequest request, Usuario usuario) {
        if (request.tipo() == TipoMovimiento.SALIDA) {
            throw new SolicitudInvalidaException("Solo se pueden registrar entradas o ajustes manuales");
        }
        if (request.tipo() == TipoMovimiento.AJUSTE && (request.motivo() == null || request.motivo().isBlank())) {
            throw new SolicitudInvalidaException("El motivo es obligatorio para un ajuste");
        }
        if (request.tipo() == TipoMovimiento.ENTRADA && request.cantidad() <= 0) {
            throw new SolicitudInvalidaException("La cantidad de una entrada debe ser mayor a 0");
        }
        if (request.tipo() == TipoMovimiento.AJUSTE && request.cantidad() == 0) {
            throw new SolicitudInvalidaException("La cantidad de un ajuste no puede ser 0");
        }

        Producto producto = productoRepository.findByIdConBloqueo(request.productoId())
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "Producto no encontrado con id " + request.productoId()));
        if (!producto.isActivo()) {
            throw new ConflictoException("No se pueden registrar movimientos de un producto inactivo");
        }

        MovimientoInventario movimiento = aplicarStockYGuardar(producto, request.tipo(), request.cantidad(),
                null, usuario, request.motivo());

        return new MovimientoCreadoResponse(
                movimiento.getId(),
                producto.getId(),
                producto.getSku(),
                producto.getNombre(),
                movimiento.getTipo(),
                movimiento.getCantidad(),
                movimiento.getMotivo(),
                null,
                usuario.getNombre(),
                movimiento.getFecha(),
                producto.getStockActual());
    }

    @Transactional(readOnly = true)
    public Page<MovimientoResponse> listar(Long productoId, TipoMovimiento tipo, LocalDateTime desde,
            LocalDateTime hasta, Pageable pageable) {
        LocalDateTime desdeParam = desde != null ? desde : LocalDateTime.of(1900, 1, 1, 0, 0);
        LocalDateTime hastaParam = hasta != null ? hasta : LocalDateTime.of(9999, 12, 31, 23, 59);
        return movimientoRepository.buscar(productoId, tipo, desdeParam, hastaParam, pageable)
                .map(inventarioMapper::toResponse);
    }

    private MovimientoInventario aplicarStockYGuardar(Producto producto, TipoMovimiento tipo, int cantidad,
            Pedido pedido, Usuario usuario, String motivo) {
        int stockActual = producto.getStockActual();
        int nuevoStock = switch (tipo) {
            case ENTRADA -> stockActual + cantidad;
            case SALIDA -> stockActual - cantidad;
            case AJUSTE -> stockActual + cantidad;
        };
        if (nuevoStock < 0) {
            throw new ConflictoException(
                    "Stock insuficiente para " + producto.getNombre() + " (disponible: " + stockActual + ")");
        }

        producto.setStockActual(nuevoStock);
        productoRepository.save(producto);

        MovimientoInventario movimiento = new MovimientoInventario();
        movimiento.setProducto(producto);
        movimiento.setUsuario(usuario);
        movimiento.setPedido(pedido);
        movimiento.setTipo(tipo);
        movimiento.setCantidad(cantidad);
        movimiento.setMotivo(motivo);

        return movimientoRepository.save(movimiento);
    }
}
