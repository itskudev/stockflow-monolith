package com.kudev.stockflow.auth;

import com.kudev.stockflow.usuario.Rol;
import com.kudev.stockflow.usuario.RolNombre;
import com.kudev.stockflow.usuario.Usuario;
import com.kudev.stockflow.usuario.repository.RolRepository;
import com.kudev.stockflow.usuario.repository.UsuarioRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class AdminInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminInitializer.class);

    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;
    private final PasswordEncoder passwordEncoder;
    private final String adminEmail;
    private final String adminPassword;

    public AdminInitializer(UsuarioRepository usuarioRepository, RolRepository rolRepository,
            PasswordEncoder passwordEncoder,
            @Value("${ADMIN_EMAIL}") String adminEmail,
            @Value("${ADMIN_PASSWORD}") String adminPassword) {
        this.usuarioRepository = usuarioRepository;
        this.rolRepository = rolRepository;
        this.passwordEncoder = passwordEncoder;
        this.adminEmail = adminEmail;
        this.adminPassword = adminPassword;
    }

    @Override
    public void run(String... args) {
        if (usuarioRepository.count() > 0) {
            return;
        }

        Rol rolAdmin = rolRepository.findByNombre(RolNombre.ADMIN)
                .orElseThrow(() -> new IllegalStateException("El rol ADMIN no existe en la base de datos"));

        Usuario admin = new Usuario();
        admin.setNombre("Administrador");
        admin.setEmail(adminEmail);
        admin.setPassword(passwordEncoder.encode(adminPassword));
        admin.setActivo(true);
        admin.setRol(rolAdmin);
        usuarioRepository.save(admin);

        log.info("Primer administrador creado: {}", adminEmail);
    }
}
