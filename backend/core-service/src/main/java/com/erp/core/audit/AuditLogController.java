package com.erp.core.audit;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * AuditLogController – read-only endpoint for audit trail queries.
 * Only ADMIN and MANAGER roles may access audit logs.
 */
@RestController
@RequestMapping("/api/v1/audit")
@RequiredArgsConstructor
public class AuditLogController {

    private final AuditLogRepository auditLogRepository;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<Page<AuditLog>> getAll(
            @RequestParam String tenantId,
            Pageable pageable) {
        return ResponseEntity.ok(
                auditLogRepository.findByTenantId(tenantId, pageable));
    }

    @GetMapping("/entity/{entityName}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<Page<AuditLog>> getByEntity(
            @RequestParam String tenantId,
            @PathVariable String entityName,
            Pageable pageable) {
        return ResponseEntity.ok(
                auditLogRepository.findByTenantIdAndEntityName(tenantId, entityName, pageable));
    }
}
