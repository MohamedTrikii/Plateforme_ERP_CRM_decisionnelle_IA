package com.erp.core.tenant;

import com.erp.core.audit.Auditable;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

/**
 * Tenant – represents a company/organization using the ERP platform.
 *
 * Multi-tenant design:
 * - Each tenant has a unique slug (id) that scopes all data queries.
 * - SystemConfig keys are stored per tenantId to allow independent branding.
 * - Users in auth-service reference this slug via their tenantId field.
 */
@Entity
@Table(name = "tenants",
       indexes = {
           @Index(name = "idx_tenants_slug", columnList = "slug")
       })
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Tenant extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Short unique identifier used everywhere as tenantId.
     * e.g. "acme", "globex", "umbrella"
     */
    @NotBlank
    @Column(unique = true, nullable = false, length = 50)
    private String slug;

    /** Display name of the company */
    @NotBlank
    @Column(nullable = false, length = 200)
    private String name;

    /** Contact email for the tenant admin */
    @Column(length = 150)
    private String contactEmail;

    /** Primary domain used by this tenant (optional) */
    @Column(length = 200)
    private String domain;

    /** Subscription tier */
    @Enumerated(EnumType.STRING)
    @Column(name = "plan_type", length = 30)
    @Builder.Default
    private PlanType planType = PlanType.STARTER;

    /** Whether this tenant is currently active */
    @Column(nullable = false)
    @Builder.Default
    private boolean active = true;

    /** Max number of users allowed (0 = unlimited) */
    @Column(name = "max_users")
    @Builder.Default
    private int maxUsers = 10;

    public enum PlanType {
        FREE,
        STARTER,
        PROFESSIONAL,
        ENTERPRISE
    }
}
