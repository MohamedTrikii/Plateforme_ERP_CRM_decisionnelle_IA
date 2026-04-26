package com.erp.core.product;

import com.erp.core.audit.Auditable;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;

/**
 * Product entity – represents a saleable item managed within the ERP.
 */
@Entity
@Table(name = "products",
       indexes = {
           @Index(name = "idx_products_tenant", columnList = "tenant_id"),
           @Index(name = "idx_products_sku",    columnList = "sku")
       })
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Product extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false, length = 200)
    private String name;

    /** Stock-Keeping Unit – unique per tenant */
    @Column(length = 80)
    private String sku;

    @Column(columnDefinition = "TEXT")
    private String description;

    @NotNull
    @DecimalMin("0.00")
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal price;

    @Column(precision = 12, scale = 2)
    private BigDecimal costPrice;

    @Column(length = 100)
    private String category;

    @Column(length = 200)
    private String imageUrl;

    @Column(name = "tenant_id", nullable = false, length = 50)
    private String tenantId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private ProductStatus status = ProductStatus.ACTIVE;

    public enum ProductStatus { ACTIVE, INACTIVE, DISCONTINUED }
}
