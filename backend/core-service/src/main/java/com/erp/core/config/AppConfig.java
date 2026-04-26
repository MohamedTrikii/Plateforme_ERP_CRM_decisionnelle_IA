package com.erp.core.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.domain.AuditorAware;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;
import java.util.concurrent.Executor;
import java.util.concurrent.Executors;

/**
 * AppConfig – general application beans.
 */
@Configuration
public class AppConfig {

    /**
     * AuditorAware – feeds the current authenticated username
     * into @CreatedBy / @LastModifiedBy fields via JPA Auditing.
     */
    @Bean
    @SuppressWarnings("null")
    public AuditorAware<String> auditorAware() {
        return () -> {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated()) {
                return Optional.of("system");
            }
            return Optional.of(auth.getName());
        };
    }

    /**
     * Async executor for AuditService's @Async methods.
     * Uses a virtual-thread executor (Java 21) for lightweight concurrency.
     */
    @Bean(name = "auditExecutor")
    public Executor auditExecutor() {
        return Executors.newVirtualThreadPerTaskExecutor();
    }
}
