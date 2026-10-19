package com.kudev.stockflow.cliente.repository;

import com.kudev.stockflow.cliente.Cliente;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ClienteRepository extends JpaRepository<Cliente, Long> {

    Optional<Cliente> findByDocumento(String documento);

    @Query("""
            select c from Cliente c
            where lower(c.nombre) like :q or lower(c.documento) like :q
            """)
    Page<Cliente> buscar(@Param("q") String q, Pageable pageable);

    @Query(value = "select count(*) > 0 from pedido where cliente_id = :clienteId", nativeQuery = true)
    boolean existePedido(@Param("clienteId") Long clienteId);
}
