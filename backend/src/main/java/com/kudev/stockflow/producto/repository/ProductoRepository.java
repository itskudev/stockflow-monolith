package com.kudev.stockflow.producto.repository;

import com.kudev.stockflow.producto.Producto;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProductoRepository extends JpaRepository<Producto, Long> {

    Optional<Producto> findBySku(String sku);

    long countByCategoriaId(Long categoriaId);

    @Query("""
            select p from Producto p
            where p.activo = :activo
              and (:categoriaId is null or p.categoria.id = :categoriaId)
              and (lower(p.nombre) like :q or lower(p.sku) like :q)
            """)
    @EntityGraph(attributePaths = "categoria")
    Page<Producto> buscar(@Param("q") String q, @Param("categoriaId") Long categoriaId,
            @Param("activo") boolean activo, Pageable pageable);

    @Query("""
            select p from Producto p
            where p.activo = true and p.stockActual <= p.stockMinimo
            order by p.stockActual asc
            """)
    @EntityGraph(attributePaths = "categoria")
    List<Producto> buscarStockBajo();
}
