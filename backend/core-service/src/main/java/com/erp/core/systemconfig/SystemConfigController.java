package com.erp.core.systemconfig;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * SystemConfigController – REST API for dynamic system configuration.
 *
 * Base path: /api/v1/config
 *
 * Public endpoint: GET /public  → theme colors, logo, company name
 * Admin endpoints: full CRUD
 */
@RestController
@RequestMapping("/api/v1/config")
@RequiredArgsConstructor
public class SystemConfigController {

    private final SystemConfigService configService;

    /**
     * Public config map – Angular reads this at startup.
     * No authentication required so the login page can apply branding.
     */
    @GetMapping("/public")
    public ResponseEntity<Map<String, String>> getPublic(
            @RequestParam("tenantId") @NonNull String tenantId) {
        return ResponseEntity.ok(configService.getPublicConfig(tenantId));
    }

    /** Full config map for authenticated admin users */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<List<SystemConfig>> getAll(
            @RequestParam("tenantId") @NonNull String tenantId) {
        return ResponseEntity.ok(configService.getAll(tenantId));
    }

    /** Flat key→value map (convenient for frontend consumption) */
    @GetMapping("/map")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<Map<String, String>> getMap(
            @RequestParam("tenantId") @NonNull String tenantId) {
        return ResponseEntity.ok(configService.getConfigMap(tenantId));
    }

    /** Create or update a single config entry */
    @PutMapping
    @PreAuthorize("hasRole('ADMIN')")
    @SuppressWarnings("java:S4684")
    public ResponseEntity<SystemConfig> upsert(
            @RequestParam("tenantId") @NonNull String tenantId,
            @Valid @RequestBody SystemConfig config) {
        return ResponseEntity.ok(configService.upsert(tenantId, config));
    }

    /** Bulk update (e.g., save entire theme in one call) */
    @PutMapping("/bulk")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> bulkUpsert(
            @RequestParam("tenantId") @NonNull String tenantId,
            @RequestBody Map<String, String> values) {
        configService.bulkUpsert(tenantId, values);
        return ResponseEntity.ok().build();
    }

    /** Delete a config entry */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(
            @PathVariable @NonNull Long id,
            @RequestParam("tenantId") @NonNull String tenantId) {
        configService.delete(id, tenantId);
        return ResponseEntity.noContent().build();
    }
}
