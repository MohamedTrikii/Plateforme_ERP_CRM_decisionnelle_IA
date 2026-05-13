package com.erp.core.customer;

import com.erp.core.audit.Auditable;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

/**
 * Customer entity – represents a business client of a tenant.
 * Scoped to a tenant via tenantId (multi-tenant isolation).
 */
@Entity
@Table(name = "customers",
       indexes = {
           @Index(name = "idx_customers_tenant", columnList = "tenant_id"),
           @Index(name = "idx_customers_email",  columnList = "email")
       })
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Customer extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false, length = 120)
    private String name;

    @Email
    @Column(length = 150)
    private String email;

    @Column(length = 30)
    private String phone;

    @Column(length = 255)
    private String address;

    @Column(length = 100)
    private String company;

    /**
     * Tenant isolation – every query should filter by this field.
     */
    @Column(name = "tenant_id", nullable = false, length = 50)
    private String tenantId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private CustomerStatus status = CustomerStatus.ACTIVE;

    public enum CustomerStatus { ACTIVE, INACTIVE, PROSPECT }
}
