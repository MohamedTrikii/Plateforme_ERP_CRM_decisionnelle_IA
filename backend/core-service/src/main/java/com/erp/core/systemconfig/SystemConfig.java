package com.erp.core.systemconfig;

import com.erp.core.audit.Auditable;
import jakarta.persistence.*;
import lombok.*;

/**
 * SystemConfig – stores ALL dynamic UI/branding configuration for a tenant.
 *
 * This is the heart of the "template engine" concept:
 * - One row per configuration key per tenant
 * - The Angular frontend reads these at startup and applies them dynamically
 * - Enables zero-code company branding changes
 *
 * Example rows:
 *   tenant_id | config_key        | config_value          | config_type
 *   acme      | primary_color     | #1A73E8               | COLOR
 *   acme      | company_logo_url  | https://cdn.../logo   | URL
 *   acme      | company_name      | ACME Corp             | TEXT
 *   acme      | sidebar_modules   | ["customers","orders"] | JSON
 */
@Entity
@Table(name = "system_config",
       uniqueConstraints = {
           @UniqueConstraint(name = "uk_config_tenant_key",
                            columnNames = {"tenant_id", "config_key"})
       },
       indexes = {
           @Index(name = "idx_config_tenant", columnList = "tenant_id")
       })
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class SystemConfig extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tenant_id", nullable = false, length = 50)
    private String tenantId;

    /** Dot-separated key, e.g. "theme.primaryColor" */
    @Column(name = "config_key", nullable = false, length = 200)
    private String configKey;

    /** The value (plain text, hex color, URL, or JSON string) */
    @Column(name = "config_value", columnDefinition = "TEXT")
    private String configValue;

    /** Categorizes the value for the frontend renderer */
    @Enumerated(EnumType.STRING)
    @Column(name = "config_type", length = 30)
    @Builder.Default
    private ConfigType configType = ConfigType.TEXT;

    /** Friendly name for the admin UI */
    @Column(length = 200)
    private String label;

    /** Optional description explaining what this config controls */
    @Column(columnDefinition = "TEXT")
    private String description;

    /** Whether this config is visible in the admin UI */
    @Column(name = "is_public")
    @Builder.Default
    private boolean isPublic = true;

    public enum ConfigType {
        TEXT,   // Plain string
        COLOR,  // CSS hex color e.g. #1A73E8
        URL,    // Image/asset URL
        JSON,   // JSON array or object
        BOOLEAN,
        NUMBER
    }
}
