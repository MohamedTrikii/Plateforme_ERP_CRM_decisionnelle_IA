package com.erp.core.order;

import com.erp.core.audit.AuditService;
import com.erp.core.stock.StockService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.concurrent.atomic.AtomicLong;

/**
 * OrderService – handles order lifecycle management.
 *
 * Key behaviors:
 * - Order number auto-generation (ORD-YYYY-NNNN)
 * - Stock reservation on order confirmation
 * - Stock deduction on order delivery
 * - Full audit trail
 */
@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final StockService    stockService;
    private final AuditService    auditService;

    // Simple in-memory sequence for demo; production: DB sequence
    private final AtomicLong orderSequence = new AtomicLong(1000);

    @Transactional(readOnly = true)
    public Page<Order> findAll(@NonNull String tenantId, @NonNull Pageable pageable) {
        return orderRepository.findByTenantId(tenantId, pageable);
    }

    @Transactional(readOnly = true)
    public Order findById(@NonNull Long id, @NonNull String tenantId) {
        return orderRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new RuntimeException("Order not found: " + id));
    }

    @Transactional
    public Order create(Order order) {
        // Auto-generate order number
        order.setOrderNumber(generateOrderNumber());

        // Set references from items back to the order
        order.getItems().forEach(item -> item.setOrder(order));

        // Calculate total
        order.recalculateTotal();

        Order saved = orderRepository.save(order);
        auditService.log("Order", saved.getOrderNumber(),
                "CREATE", null, saved, saved.getTenantId());
        return saved;
    }

    @Transactional
    public Order updateStatus(@NonNull Long id, @NonNull String tenantId, Order.OrderStatus newStatus) {
        Order order = orderRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new RuntimeException("Order not found: " + id));
        Order.OrderStatus oldStatus = order.getStatus();

        // Stock side-effects based on status transitions
        if (newStatus == Order.OrderStatus.CONFIRMED) {
            // Reserve stock for each item
            order.getItems().forEach(item -> {
                Long productId = java.util.Objects.requireNonNull(item.getProduct().getId());
                stockService.reserve(productId,
                                     tenantId,
                                     item.getQuantity());
            });
        } else if (newStatus == Order.OrderStatus.DELIVERED) {
            // Deduct stock permanently
            order.getItems().forEach(item -> {
                Long productId = java.util.Objects.requireNonNull(item.getProduct().getId());
                stockService.deduct(productId,
                                    tenantId,
                                    item.getQuantity());
            });
        } else if (newStatus == Order.OrderStatus.CANCELLED
                   && oldStatus == Order.OrderStatus.CONFIRMED) {
            // Release previously reserved stock
            order.getItems().forEach(item -> {
                Long productId = java.util.Objects.requireNonNull(item.getProduct().getId());
                stockService.release(productId,
                                     tenantId,
                                     item.getQuantity());
            });
        }

        order.setStatus(newStatus);
        Order updated = orderRepository.save(order);
        auditService.log("Order", order.getOrderNumber(),
                "STATUS_CHANGE",
                oldStatus.name(),
                newStatus.name(),
                tenantId);
        return updated;
    }

    @Transactional(readOnly = true)
    public BigDecimal getRevenue(String tenantId, LocalDate from, LocalDate to) {
        return orderRepository.sumRevenue(tenantId, from, to);
    }

    public long countByStatus(String tenantId, Order.OrderStatus status) {
        return orderRepository.countByTenantIdAndStatus(tenantId, status);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private String generateOrderNumber() {
        return String.format("ORD-%s-%04d",
                LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy")),
                orderSequence.incrementAndGet());
    }
}
