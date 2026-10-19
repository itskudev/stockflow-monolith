package com.kudev.stockflow.usuario;

import com.kudev.stockflow.usuario.dto.UsuarioActivoRequest;
import com.kudev.stockflow.usuario.dto.UsuarioCreateRequest;
import com.kudev.stockflow.usuario.dto.UsuarioResponse;
import com.kudev.stockflow.usuario.dto.UsuarioUpdateRequest;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/usuarios")
@PreAuthorize("hasRole('ADMIN')")
public class UsuarioController {

    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @PostMapping
    public ResponseEntity<UsuarioResponse> crear(@Valid @RequestBody UsuarioCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(usuarioService.crear(request));
    }

    @GetMapping
    public Page<UsuarioResponse> listar(@PageableDefault(size = 10) Pageable pageable) {
        return usuarioService.listar(pageable);
    }

    @GetMapping("/{id}")
    public UsuarioResponse obtener(@PathVariable Long id) {
        return usuarioService.obtener(id);
    }

    @PutMapping("/{id}")
    public UsuarioResponse actualizar(@PathVariable Long id, @Valid @RequestBody UsuarioUpdateRequest request) {
        return usuarioService.actualizar(id, request);
    }

    @PatchMapping("/{id}/activo")
    public UsuarioResponse cambiarActivo(@PathVariable Long id, @Valid @RequestBody UsuarioActivoRequest request) {
        return usuarioService.cambiarActivo(id, request.activo());
    }
}
