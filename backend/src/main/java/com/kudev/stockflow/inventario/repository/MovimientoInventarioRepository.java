package com.kudev.stockflow.inventario.repository;

import com.kudev.stockflow.inventario.MovimientoInventario;
import com.kudev.stockflow.inventario.TipoMovimiento;
import java.time.LocalDateTime;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface MovimientoInventarioRepository extends JpaRepository<MovimientoInventario, Long> {

    @EntityGraph(attributePaths = {"producto", "usuario"})
    @Query("""
            select m from MovimientoInventario m
            where (:productoId is null or m.producto.id = :productoId)
              and (:tipo is null or m.tipo = :tipo)
              and m.fecha >= :desde
              and m.fecha <= :hasta
            order by m.fecha desc
            """)
    Page<MovimientoInventario> buscar(
            @Param("productoId") Long productoId,
            @Param("tipo") TipoMovimiento tipo,
            @Param("desde") LocalDateTime desde,
            @Param("hasta") LocalDateTime hasta,
            Pageable pageable);
}
