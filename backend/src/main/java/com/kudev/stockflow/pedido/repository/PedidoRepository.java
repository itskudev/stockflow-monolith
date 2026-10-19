package com.kudev.stockflow.pedido.repository;

import com.kudev.stockflow.pedido.EstadoPedido;
import com.kudev.stockflow.pedido.Pedido;
import jakarta.persistence.LockModeType;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PedidoRepository extends JpaRepository<Pedido, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select p from Pedido p where p.id = :id")
    Optional<Pedido> findByIdConBloqueo(@Param("id") Long id);

    @Override
    @EntityGraph(attributePaths = {"cliente", "usuario", "detalles", "detalles.producto"})
    Optional<Pedido> findById(Long id);

    @Query("""
            select p from Pedido p
            where (:estado is null or p.estado = :estado)
              and (:clienteId is null or p.cliente.id = :clienteId)
            order by p.fechaCreacion desc
            """)
    @EntityGraph(attributePaths = "cliente")
    Page<Pedido> buscar(@Param("estado") EstadoPedido estado, @Param("clienteId") Long clienteId, Pageable pageable);
}
