package com.kudev.stockflow.usuario;

import com.kudev.stockflow.common.exception.ConflictoException;
import com.kudev.stockflow.common.exception.RecursoNoEncontradoException;
import com.kudev.stockflow.usuario.dto.UsuarioCreateRequest;
import com.kudev.stockflow.usuario.dto.UsuarioResponse;
import com.kudev.stockflow.usuario.dto.UsuarioUpdateRequest;
import com.kudev.stockflow.usuario.repository.RolRepository;
import com.kudev.stockflow.usuario.repository.UsuarioRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;
    private final PasswordEncoder passwordEncoder;
    private final UsuarioMapper usuarioMapper;

    public UsuarioService(UsuarioRepository usuarioRepository, RolRepository rolRepository,
            PasswordEncoder passwordEncoder, UsuarioMapper usuarioMapper) {
        this.usuarioRepository = usuarioRepository;
        this.rolRepository = rolRepository;
        this.passwordEncoder = passwordEncoder;
        this.usuarioMapper = usuarioMapper;
    }

    @Transactional
    public UsuarioResponse crear(UsuarioCreateRequest request) {
        if (usuarioRepository.existsByEmail(request.email())) {
            throw new ConflictoException("El email ya está registrado");
        }
        Rol rol = buscarRol(request.rolId());

        Usuario usuario = new Usuario();
        usuario.setNombre(request.nombre());
        usuario.setEmail(request.email());
        usuario.setPassword(passwordEncoder.encode(request.password()));
        usuario.setActivo(true);
        usuario.setRol(rol);

        return usuarioMapper.toResponse(usuarioRepository.save(usuario));
    }

    @Transactional(readOnly = true)
    public Page<UsuarioResponse> listar(Pageable pageable) {
        return usuarioRepository.findAll(pageable).map(usuarioMapper::toResponse);
    }

    @Transactional(readOnly = true)
    public UsuarioResponse obtener(Long id) {
        return usuarioMapper.toResponse(buscar(id));
    }

    @Transactional
    public UsuarioResponse actualizar(Long id, UsuarioUpdateRequest request) {
        Usuario usuario = buscar(id);
        if (usuarioRepository.existsByEmail(request.email())
                && !usuario.getEmail().equals(request.email())) {
            throw new ConflictoException("El email ya está registrado");
        }
        usuario.setNombre(request.nombre());
        usuario.setEmail(request.email());
        usuario.setRol(buscarRol(request.rolId()));

        return usuarioMapper.toResponse(usuarioRepository.save(usuario));
    }

    @Transactional
    public UsuarioResponse cambiarActivo(Long id, boolean activo) {
        Usuario usuario = buscar(id);
        if (!activo && usuario.getId().equals(usuarioAutenticado().getId())) {
            throw new ConflictoException("Un administrador no puede desactivarse a sí mismo");
        }
        usuario.setActivo(activo);

        return usuarioMapper.toResponse(usuarioRepository.save(usuario));
    }

    private Usuario buscar(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado con id " + id));
    }

    private Rol buscarRol(Long rolId) {
        return rolRepository.findById(rolId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Rol no encontrado con id " + rolId));
    }

    private Usuario usuarioAutenticado() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null) {
            throw new RecursoNoEncontradoException("Usuario autenticado no encontrado");
        }
        return usuarioRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario autenticado no encontrado"));
    }
}
