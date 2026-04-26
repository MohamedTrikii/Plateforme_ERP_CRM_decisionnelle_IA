package com.erp.core.dashboard;

import com.erp.core.customer.CustomerRepository;
import com.erp.core.order.Order;
import com.erp.core.order.OrderRepository;
import com.erp.core.product.ProductRepository;
import com.erp.core.stock.StockRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

/**
 * DashboardService – aggregates KPIs for the dashboard in a single query pass.
 * All queries are read-only and scoped by tenantId.
 */
@Service
@RequiredArgsConstructor
public class DashboardService {

    private final CustomerRepository customerRepository;
    private final ProductRepository  productRepository;
    private final OrderRepository    orderRepository;
    private final StockRepository    stockRepository;

    @Transactional(readOnly = true)
    public DashboardStats getStats(String tenantId) {
        LocalDate now        = LocalDate.now();
        LocalDate monthStart = now.withDayOfMonth(1);
        LocalDate lastMonthStart = monthStart.minusMonths(1);
        LocalDate lastMonthEnd   = monthStart.minusDays(1);

        // ── Counters ─────────────────────────────────────────────────────────
        long totalCustomers = customerRepository.countByTenantId(tenantId);
        long totalProducts  = productRepository.countByTenantId(tenantId);
        long totalOrders    = orderRepository.countByTenantId(tenantId);
        long pendingOrders  = orderRepository.countByTenantIdAndStatus(tenantId, Order.OrderStatus.PENDING);
        long deliveredOrders = orderRepository.countByTenantIdAndStatus(tenantId, Order.OrderStatus.DELIVERED);

        // ── Revenue ───────────────────────────────────────────────────────────
        BigDecimal revenueThisMonth = orderRepository.sumRevenue(tenantId, monthStart, now);
        BigDecimal revenueLastMonth = orderRepository.sumRevenue(tenantId, lastMonthStart, lastMonthEnd);
        BigDecimal totalRevenue     = orderRepository.sumRevenue(
                tenantId,
                LocalDate.of(2000, 1, 1), // full history
                now);

        // ── Inventory ─────────────────────────────────────────────────────────
        long lowStockCount = stockRepository.findLowStockItems(tenantId).size();
        long outOfStockCount = stockRepository.findLowStockItems(tenantId).stream()
                .filter(s -> s.getQuantityOnHand() <= 0)
                .count();

        // ── Revenue by month (last 6 months) ──────────────────────────────────
        Map<String, BigDecimal> revenueByMonth = buildRevenueByMonth(tenantId, now);

        // ── Order status breakdown ────────────────────────────────────────────
        Map<String, Long> ordersByStatus = new LinkedHashMap<>();
        for (Order.OrderStatus status : Order.OrderStatus.values()) {
            ordersByStatus.put(status.name(),
                    orderRepository.countByTenantIdAndStatus(tenantId, status));
        }

        return DashboardStats.builder()
                .totalCustomers(totalCustomers)
                .activeCustomers(totalCustomers)    // refined if status filter added
                .totalProducts(totalProducts)
                .totalOrders(totalOrders)
                .pendingOrders(pendingOrders)
                .deliveredOrders(deliveredOrders)
                .totalRevenue(totalRevenue != null ? totalRevenue : BigDecimal.ZERO)
                .revenueThisMonth(revenueThisMonth != null ? revenueThisMonth : BigDecimal.ZERO)
                .revenueLastMonth(revenueLastMonth != null ? revenueLastMonth : BigDecimal.ZERO)
                .lowStockProductCount(lowStockCount)
                .outOfStockCount(outOfStockCount)
                .revenueByMonth(revenueByMonth)
                .ordersByStatus(ordersByStatus)
                .topProducts(Collections.emptyList())   // extended via AI service later
                .build();
    }

    /** Builds revenue map for the last 6 months in chronological order. */
    private Map<String, BigDecimal> buildRevenueByMonth(String tenantId, LocalDate today) {
        Map<String, BigDecimal> map = new LinkedHashMap<>();
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy-MM");
        for (int i = 5; i >= 0; i--) {
            LocalDate start = today.withDayOfMonth(1).minusMonths(i);
            LocalDate end   = start.withDayOfMonth(start.lengthOfMonth());
            BigDecimal rev  = orderRepository.sumRevenue(tenantId, start, end);
            map.put(start.format(fmt), rev != null ? rev : BigDecimal.ZERO);
        }
        return map;
    }
}
