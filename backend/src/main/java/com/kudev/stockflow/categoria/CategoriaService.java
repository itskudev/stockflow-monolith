package com.kudev.stockflow.categoria;

import com.kudev.stockflow.categoria.dto.CategoriaRequest;
import com.kudev.stockflow.categoria.dto.CategoriaResponse;
import com.kudev.stockflow.categoria.repository.CategoriaRepository;
import com.kudev.stockflow.common.exception.ConflictoException;
import com.kudev.stockflow.common.exception.RecursoNoEncontradoException;
import com.kudev.stockflow.producto.repository.ProductoRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CategoriaService {

    private final CategoriaRepository categoriaRepository;
    private final ProductoRepository productoRepository;
    private final CategoriaMapper categoriaMapper;

    public CategoriaService(CategoriaRepository categoriaRepository, ProductoRepository productoRepository,
            CategoriaMapper categoriaMapper) {
        this.categoriaRepository = categoriaRepository;
        this.productoRepository = productoRepository;
        this.categoriaMapper = categoriaMapper;
    }

    @Transactional
    public CategoriaResponse crear(CategoriaRequest request) {
        validarNombreDuplicado(request.nombre(), null);

        Categoria categoria = new Categoria();
        categoria.setNombre(request.nombre());
        categoria.setDescripcion(request.descripcion());

        return categoriaMapper.toResponse(categoriaRepository.save(categoria));
    }

    @Transactional(readOnly = true)
    public List<CategoriaResponse> listar() {
        return categoriaRepository.findAll().stream()
                .map(categoriaMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public CategoriaResponse obtener(Long id) {
        return categoriaMapper.toResponse(buscar(id));
    }

    @Transactional
    public CategoriaResponse actualizar(Long id, CategoriaRequest request) {
        Categoria categoria = buscar(id);
        validarNombreDuplicado(request.nombre(), id);
        categoria.setNombre(request.nombre());
        categoria.setDescripcion(request.descripcion());

        return categoriaMapper.toResponse(categoriaRepository.save(categoria));
    }

    @Transactional
    public void eliminar(Long id) {
        Categoria categoria = buscar(id);
        if (productoRepository.countByCategoriaId(id) > 0) {
            throw new ConflictoException("No se puede eliminar una categoría que tiene productos");
        }
        categoriaRepository.delete(categoria);
    }

    private Categoria buscar(Long id) {
        return categoriaRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Categoría no encontrada con id " + id));
    }

    private void validarNombreDuplicado(String nombre, Long idExcluido) {
        boolean duplicado = categoriaRepository.findByNombre(nombre)
                .filter(existente -> idExcluido == null || !existente.getId().equals(idExcluido))
                .isPresent();
        if (duplicado) {
            throw new ConflictoException("Ya existe una categoría con ese nombre");
        }
    }
}
