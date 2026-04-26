package com.erp.core.stock;

import com.erp.core.audit.Auditable;
import com.erp.core.product.Product;
import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import lombok.*;

/**
 * Stock entity – tracks quantity on hand for each product per tenant.
 * Linked 1-to-1 with Product (each product has exactly one stock record).
 */
@Entity
@Table(name = "stock",
       indexes = {
           @Index(name = "idx_stock_tenant",  columnList = "tenant_id"),
           @Index(name = "idx_stock_product", columnList = "product_id")
       })
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Stock extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** One stock record per product */
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false, unique = true)
    private Product product;

    /** Current units available */
    @Min(0)
    @Column(name = "quantity_on_hand", nullable = false)
    @Builder.Default
    private Integer quantityOnHand = 0;

    /** Units reserved by pending orders */
    @Min(0)
    @Column(name = "quantity_reserved")
    @Builder.Default
    private Integer quantityReserved = 0;

    /** Reorder point – triggers low-stock alert */
    @Column(name = "reorder_level")
    @Builder.Default
    private Integer reorderLevel = 10;

    /** Desired level to reorder up to */
    @Column(name = "reorder_quantity")
    @Builder.Default
    private Integer reorderQuantity = 50;

    @Column(name = "tenant_id", nullable = false, length = 50)
    private String tenantId;

    /** Available = on-hand minus reserved */
    @Transient
    public int getAvailableQuantity() {
        return quantityOnHand - (quantityReserved != null ? quantityReserved : 0);
    }

    /** Returns true when stock is at or below the reorder threshold */
    @Transient
    public boolean isLowStock() {
        return getAvailableQuantity() <= reorderLevel;
    }
}
