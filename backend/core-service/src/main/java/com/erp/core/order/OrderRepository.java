package com.erp.core.order;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    Page<Order> findByTenantId(String tenantId, Pageable pageable);

    Page<Order> findByCustomerIdAndTenantId(Long customerId, String tenantId, Pageable pageable);

    Optional<Order> findByIdAndTenantId(Long id, String tenantId);

    Optional<Order> findByOrderNumberAndTenantId(String orderNumber, String tenantId);

    /** Revenue by tenant within a date range – used for dashboard KPIs */
    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o " +
           "WHERE o.tenantId = :tenantId " +
           "AND o.orderDate BETWEEN :from AND :to " +
           "AND o.status <> 'CANCELLED'")
    BigDecimal sumRevenue(@Param("tenantId") String tenantId,
                          @Param("from") LocalDate from,
                          @Param("to") LocalDate to);

    /** Monthly sales for AI training data */
    @Query(value = """
            SELECT DATE_TRUNC('month', o.order_date) AS month,
                   oi.product_id,
                   SUM(oi.quantity) AS total_qty
            FROM orders o
            JOIN order_items oi ON oi.order_id = o.id
            WHERE o.tenant_id = :tenantId
            GROUP BY 1, 2
            ORDER BY 1
            """, nativeQuery = true)
    List<Object[]> getMonthlySalesByProduct(@Param("tenantId") String tenantId);

    long countByTenantId(String tenantId);

    long countByTenantIdAndStatus(String tenantId, Order.OrderStatus status);
}
