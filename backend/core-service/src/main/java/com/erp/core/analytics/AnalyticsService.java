package com.erp.core.analytics;

import com.erp.core.customer.CustomerRepository;
import com.erp.core.order.Order;
import com.erp.core.order.OrderRepository;
import com.erp.core.product.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;

/**
 * AnalyticsService – provides aggregated analytics data for charts and reports.
 *
 * Endpoints support:
 * - Monthly revenue trend (configurable number of months)
 * - Revenue breakdown by order status
 * - New customers per month
 * - Top products by revenue and quantity
 * - Order volume trend
 */
@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final OrderRepository    orderRepository;
    private final CustomerRepository customerRepository;
    private final ProductRepository  productRepository;

    private static final DateTimeFormatter MONTH_FMT = DateTimeFormatter.ofPattern("yyyy-MM");

    // ── Revenue Trend ─────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public Map<String, BigDecimal> getMonthlyRevenue(String tenantId, int months) {
        return computeMonthlyRevenue(tenantId, months);
    }

    private Map<String, BigDecimal> computeMonthlyRevenue(String tenantId, int months) {
        LocalDate now = LocalDate.now();
        Map<String, BigDecimal> result = new LinkedHashMap<>();
        for (int i = months - 1; i >= 0; i--) {
            LocalDate start = now.withDayOfMonth(1).minusMonths(i);
            LocalDate end   = start.withDayOfMonth(start.lengthOfMonth());
            BigDecimal rev  = orderRepository.sumRevenue(tenantId, start, end);
            result.put(start.format(MONTH_FMT), rev != null ? rev : BigDecimal.ZERO);
        }
        return result;
    }

    // ── Order Volume Trend ────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public Map<String, Long> getMonthlyOrderVolume(String tenantId, int months) {
        return computeMonthlyOrderVolume(tenantId, months);
    }

    private Map<String, Long> computeMonthlyOrderVolume(String tenantId, int months) {
        LocalDate now = LocalDate.now();
        Map<String, Long> result = new LinkedHashMap<>();
        for (int i = months - 1; i >= 0; i--) {
            LocalDate start = now.withDayOfMonth(1).minusMonths(i);
            LocalDate end   = start.withDayOfMonth(start.lengthOfMonth());
            long count = orderRepository.countOrdersInRange(tenantId, start, end);
            result.put(start.format(MONTH_FMT), count);
        }
        return result;
    }

    // ── Orders by Status ──────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public Map<String, Long> getOrdersByStatus(String tenantId) {
        return computeOrdersByStatus(tenantId);
    }

    private Map<String, Long> computeOrdersByStatus(String tenantId) {
        Map<String, Long> result = new LinkedHashMap<>();
        for (Order.OrderStatus status : Order.OrderStatus.values()) {
            result.put(status.name(), orderRepository.countByTenantIdAndStatus(tenantId, status));
        }
        return result;
    }

    // ── Summary ───────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public AnalyticsSummary getSummary(String tenantId) {
        LocalDate now        = LocalDate.now();
        LocalDate monthStart = now.withDayOfMonth(1);
        LocalDate lastMonthStart = monthStart.minusMonths(1);
        LocalDate lastMonthEnd   = monthStart.minusDays(1);

        BigDecimal thisMonth = orderRepository.sumRevenue(tenantId, monthStart, now);
        BigDecimal lastMonth = orderRepository.sumRevenue(tenantId, lastMonthStart, lastMonthEnd);
        BigDecimal thisMonthSafe = thisMonth != null ? thisMonth : BigDecimal.ZERO;
        BigDecimal lastMonthSafe = lastMonth != null ? lastMonth : BigDecimal.ZERO;

        double growth = 0;
        if (lastMonthSafe.compareTo(BigDecimal.ZERO) > 0) {
            growth = thisMonthSafe.subtract(lastMonthSafe)
                    .divide(lastMonthSafe, 4, java.math.RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100))
                    .doubleValue();
        }

        return AnalyticsSummary.builder()
                .totalCustomers(customerRepository.countByTenantId(tenantId))
                .totalProducts(productRepository.countByTenantId(tenantId))
                .totalOrders(orderRepository.countByTenantId(tenantId))
                .revenueThisMonth(thisMonthSafe)
                .revenueLastMonth(lastMonthSafe)
                .revenueGrowthPercent(Math.round(growth))
                .monthlyRevenue(computeMonthlyRevenue(tenantId, 12))
                .monthlyOrderVolume(computeMonthlyOrderVolume(tenantId, 12))
                .ordersByStatus(computeOrdersByStatus(tenantId))
                .build();
    }

    // ── Inner DTO ─────────────────────────────────────────────────────────────

    @lombok.Data
    @lombok.Builder
    public static class AnalyticsSummary {
        private long totalCustomers;
        private long totalProducts;
        private long totalOrders;
        private BigDecimal revenueThisMonth;
        private BigDecimal revenueLastMonth;
        private long revenueGrowthPercent;
        private Map<String, BigDecimal> monthlyRevenue;
        private Map<String, Long>       monthlyOrderVolume;
        private Map<String, Long>       ordersByStatus;
    }
}
