package com.erp.core.order;

import com.erp.core.audit.Auditable;
import com.erp.core.customer.Customer;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * Order entity – a sales transaction placed by a Customer.
 * Contains one or more OrderItems (line items).
 */
@Entity
@Table(name = "orders",
       indexes = {
           @Index(name = "idx_orders_tenant",   columnList = "tenant_id"),
           @Index(name = "idx_orders_customer", columnList = "customer_id"),
           @Index(name = "idx_orders_date",     columnList = "order_date")
       })
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Order extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Human-readable reference, e.g. "ORD-2024-0001" */
    @Column(name = "order_number", unique = true, length = 50)
    private String orderNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @Column(name = "order_date", nullable = false)
    @Builder.Default
    private LocalDate orderDate = LocalDate.now();

    @Column(name = "expected_delivery_date")
    private LocalDate expectedDeliveryDate;

    /**
     * Cascade ALL: creating/updating an order also persists its items.
     * OrphanRemoval: removing an item from the list deletes it from the DB.
     */
    @OneToMany(mappedBy = "order",
               cascade = CascadeType.ALL,
               orphanRemoval = true,
               fetch = FetchType.EAGER)
    @Builder.Default
    private List<OrderItem> items = new ArrayList<>();

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private OrderStatus status = OrderStatus.PENDING;

    /** Computed total – stored for fast reporting queries */
    @Column(name = "total_amount", precision = 14, scale = 2)
    private BigDecimal totalAmount;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "tenant_id", nullable = false, length = 50)
    private String tenantId;

    /** Recalculates the stored total from line items */
    public void recalculateTotal() {
        this.totalAmount = items.stream()
                .map(OrderItem::getLineTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public enum OrderStatus {
        PENDING,
        CONFIRMED,
        PROCESSING,
        SHIPPED,
        DELIVERED,
        CANCELLED
    }
}
