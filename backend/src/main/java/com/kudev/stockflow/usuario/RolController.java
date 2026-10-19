package com.kudev.stockflow.usuario;

import com.kudev.stockflow.usuario.dto.RolResponse;
import com.kudev.stockflow.usuario.repository.RolRepository;
import java.util.List;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/roles")
@PreAuthorize("hasRole('ADMIN')")
public class RolController {

    private final RolRepository rolRepository;
    private final RolMapper rolMapper;

    public RolController(RolRepository rolRepository, RolMapper rolMapper) {
        this.rolRepository = rolRepository;
        this.rolMapper = rolMapper;
    }

    @GetMapping
    public List<RolResponse> listar() {
        return rolRepository.findAll(Sort.by("id")).stream()
                .map(rolMapper::toResponse)
                .toList();
    }
}
