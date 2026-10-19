package com.kudev.stockflow.producto;

import com.kudev.stockflow.categoria.Categoria;
import com.kudev.stockflow.categoria.repository.CategoriaRepository;
import com.kudev.stockflow.common.exception.ConflictoException;
import com.kudev.stockflow.common.exception.RecursoNoEncontradoException;
import com.kudev.stockflow.producto.dto.ProductoRequest;
import com.kudev.stockflow.producto.dto.ProductoResponse;
import com.kudev.stockflow.producto.repository.ProductoRepository;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProductoService {

    private final ProductoRepository productoRepository;
    private final CategoriaRepository categoriaRepository;
    private final ProductoMapper productoMapper;

    public ProductoService(ProductoRepository productoRepository, CategoriaRepository categoriaRepository,
            ProductoMapper productoMapper) {
        this.productoRepository = productoRepository;
        this.categoriaRepository = categoriaRepository;
        this.productoMapper = productoMapper;
    }

    @Transactional
    public ProductoResponse crear(ProductoRequest request) {
        validarSkuDuplicado(request.sku(), null);

        Producto producto = new Producto();
        producto.setSku(request.sku());
        producto.setNombre(request.nombre());
        producto.setDescripcion(request.descripcion());
        producto.setPrecio(request.precio());
        producto.setStockMinimo(request.stockMinimo());
        producto.setCategoria(buscarCategoria(request.categoriaId()));

        return productoMapper.toResponse(productoRepository.save(producto));
    }

    @Transactional(readOnly = true)
    public Page<ProductoResponse> listar(String q, Long categoriaId, Boolean activo, Pageable pageable) {
        String patron = armarPatron(q);
        boolean soloActivos = activo == null || activo;
        return productoRepository.buscar(patron, categoriaId, soloActivos, pageable)
                .map(productoMapper::toResponse);
    }

    @Transactional(readOnly = true)
    public ProductoResponse obtener(Long id) {
        return productoMapper.toResponse(buscar(id));
    }

    @Transactional
    public ProductoResponse actualizar(Long id, ProductoRequest request) {
        Producto producto = buscar(id);
        validarSkuDuplicado(request.sku(), id);
        producto.setSku(request.sku());
        producto.setNombre(request.nombre());
        producto.setDescripcion(request.descripcion());
        producto.setPrecio(request.precio());
        producto.setStockMinimo(request.stockMinimo());
        producto.setCategoria(buscarCategoria(request.categoriaId()));

        return productoMapper.toResponse(productoRepository.save(producto));
    }

    @Transactional
    public ProductoResponse eliminar(Long id) {
        Producto producto = buscar(id);
        producto.setActivo(false);

        return productoMapper.toResponse(productoRepository.save(producto));
    }

    @Transactional(readOnly = true)
    public List<ProductoResponse> buscarStockBajo() {
        return productoRepository.buscarStockBajo().stream()
                .map(productoMapper::toResponse)
                .toList();
    }

    private String armarPatron(String q) {
        return (q == null || q.isBlank()) ? "%" : "%" + q.trim().toLowerCase() + "%";
    }

    private Producto buscar(Long id) {
        return productoRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Producto no encontrado con id " + id));
    }

    private Categoria buscarCategoria(Long categoriaId) {
        return categoriaRepository.findById(categoriaId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Categoría no encontrada con id " + categoriaId));
    }

    private void validarSkuDuplicado(String sku, Long idExcluido) {
        boolean duplicado = productoRepository.findBySku(sku)
                .filter(existente -> idExcluido == null || !existente.getId().equals(idExcluido))
                .isPresent();
        if (duplicado) {
            throw new ConflictoException("Ya existe un producto con ese SKU");
        }
    }
}
