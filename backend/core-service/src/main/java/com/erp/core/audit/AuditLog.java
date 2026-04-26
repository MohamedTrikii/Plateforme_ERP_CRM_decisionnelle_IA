package com.erp.core.audit;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * AuditLog – immutable record of every state-changing operation in the system.
 *
 * Every CREATE / UPDATE / DELETE on any entity triggers an audit entry.
 * This satisfies the governance requirement: "who changed what and when".
 */
@Entity
@Table(name = "audit_logs",
       indexes = {
           @Index(name = "idx_audit_entity",    columnList = "entity_name, entity_id"),
           @Index(name = "idx_audit_tenant",    columnList = "tenant_id"),
           @Index(name = "idx_audit_timestamp", columnList = "timestamp")
       })
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** e.g. "Customer", "Product", "SystemConfig" */
    @Column(name = "entity_name", nullable = false, length = 100)
    private String entityName;

    /** Primary key of the modified record */
    @Column(name = "entity_id", length = 100)
    private String entityId;

    /** CREATE | UPDATE | DELETE | LOGIN | CONFIG_CHANGE */
    @Column(nullable = false, length = 30)
    private String action;

    /** Username that performed the action */
    @Column(name = "performed_by", length = 80)
    private String performedBy;

    @Column(name = "tenant_id", length = 50)
    private String tenantId;

    /** JSON snapshot of the entity before the change (for rollback / diff) */
    @Column(name = "old_value", columnDefinition = "TEXT")
    private String oldValue;

    /** JSON snapshot of the entity after the change */
    @Column(name = "new_value", columnDefinition = "TEXT")
    private String newValue;

    /** Human-readable description */
    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();

    /** Client IP address for security tracing */
    @Column(name = "ip_address", length = 50)
    private String ipAddress;
}
