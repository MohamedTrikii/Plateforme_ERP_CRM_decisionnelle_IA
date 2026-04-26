package com.erp.core.audit;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    Page<AuditLog> findByTenantId(String tenantId, Pageable pageable);

    Page<AuditLog> findByTenantIdAndEntityName(String tenantId, String entityName, Pageable pageable);

    Page<AuditLog> findByTenantIdAndPerformedBy(String tenantId, String performedBy, Pageable pageable);
}
