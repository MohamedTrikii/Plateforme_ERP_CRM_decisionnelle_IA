package com.erp.auth.config;

import com.erp.auth.entity.Role;
import com.erp.auth.entity.User;
import com.erp.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * DataInitializer – seeds the default admin account on startup if it does not exist.
 * This ensures the application is usable in local-dev mode without running init.sql.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements ApplicationRunner {

    private final UserRepository  userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(ApplicationArguments args) {
        if (userRepository.existsByUsername("admin")) {
            log.debug("Admin user already exists – skipping seed.");
            return;
        }

        User admin = User.builder()
                .username("admin")
                .email("admin@erp.local")
                .password(passwordEncoder.encode("Admin@1234"))
                .fullName("System Administrator")
                .role(Role.ADMIN)
                .tenantId("default")
                .enabled(true)
                .build();

        userRepository.save(admin);
        log.info("Default admin user created (username=admin, tenant=default).");
    }
}
