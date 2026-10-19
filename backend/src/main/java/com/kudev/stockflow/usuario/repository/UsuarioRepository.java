package com.kudev.stockflow.usuario.repository;

import com.kudev.stockflow.usuario.Usuario;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    @Query("select u from Usuario u join fetch u.rol where u.email = :email")
    Optional<Usuario> findByEmail(@Param("email") String email);

    boolean existsByEmail(String email);

    @Override
    @EntityGraph(attributePaths = "rol")
    Page<Usuario> findAll(Pageable pageable);
}
