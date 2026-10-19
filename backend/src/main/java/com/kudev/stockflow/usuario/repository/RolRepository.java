package com.kudev.stockflow.usuario.repository;

import com.kudev.stockflow.usuario.Rol;
import com.kudev.stockflow.usuario.RolNombre;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RolRepository extends JpaRepository<Rol, Long> {

    Optional<Rol> findByNombre(RolNombre nombre);
}
