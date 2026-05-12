package com.erp.core.tenant;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * TenantController – REST API for tenant (company) management.
 * Only ADMIN role can manage tenants.
 *
 * Base path: /api/v1/tenants
 */
@RestController
@RequestMapping("/api/v1/tenants")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class TenantController {

    private final TenantService tenantService;

    @GetMapping
    public ResponseEntity<Page<Tenant>> list(@NonNull Pageable pageable) {
        return ResponseEntity.ok(tenantService.findAll(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Tenant> getById(@PathVariable @NonNull Long id) {
        return ResponseEntity.ok(tenantService.findById(id));
    }

    @GetMapping("/slug/{slug}")
    @PreAuthorize("permitAll()")   // allow any authenticated user to look up their own tenant
    public ResponseEntity<Tenant> getBySlug(@PathVariable @NonNull String slug) {
        return ResponseEntity.ok(tenantService.findBySlug(slug));
    }

    @PostMapping
    @SuppressWarnings("java:S4684")
    public ResponseEntity<Tenant> create(@Valid @RequestBody Tenant tenant) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(tenantService.create(tenant));
    }

    @PutMapping("/{id}")
    @SuppressWarnings("java:S4684")
    public ResponseEntity<Tenant> update(
            @PathVariable @NonNull Long id,
            @Valid @RequestBody Tenant tenant) {
        return ResponseEntity.ok(tenantService.update(id, tenant));
    }

    @PatchMapping("/{id}/toggle-active")
    public ResponseEntity<Tenant> toggleActive(@PathVariable @NonNull Long id) {
        return ResponseEntity.ok(tenantService.toggleActive(id));
    }
}
