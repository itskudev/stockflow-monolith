package com.kudev.stockflow.auth;

import com.kudev.stockflow.auth.dto.LoginRequest;
import com.kudev.stockflow.auth.dto.LoginResponse;
import com.kudev.stockflow.security.JwtService;
import com.kudev.stockflow.usuario.Usuario;
import com.kudev.stockflow.usuario.repository.UsuarioRepository;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private static final String MENSAJE_GENERICO = "Credenciales incorrectas o usuario inactivo";

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public LoginResponse login(LoginRequest request) {
        Usuario usuario = usuarioRepository.findByEmail(request.email())
                .orElseThrow(() -> new BadCredentialsException(MENSAJE_GENERICO));

        if (!usuario.isActivo() || !passwordEncoder.matches(request.password(), usuario.getPassword())) {
            throw new BadCredentialsException(MENSAJE_GENERICO);
        }

        String rol = usuario.getRol().getNombre().name();
        String token = jwtService.generarToken(usuario.getEmail(), rol);

        return new LoginResponse(token, "Bearer", usuario.getEmail(), usuario.getNombre(), usuario.getRol().getNombre());
    }
}
