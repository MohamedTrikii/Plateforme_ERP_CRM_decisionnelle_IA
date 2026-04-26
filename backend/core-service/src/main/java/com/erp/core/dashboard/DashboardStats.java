package com.erp.core.dashboard;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * DashboardStats – DTO aggregating all KPIs displayed on the main dashboard.
 * Returned as a single JSON object to minimize round-trips.
 */
@Data
@Builder
public class DashboardStats {

    // ── Core counters ──────────────────────────────────────────────────────────
    private long totalCustomers;
    private long activeCustomers;
    private long totalProducts;
    private long totalOrders;
    private long pendingOrders;
    private long deliveredOrders;

    // ── Revenue ────────────────────────────────────────────────────────────────
    private BigDecimal totalRevenue;         // sum of DELIVERED orders
    private BigDecimal revenueThisMonth;
    private BigDecimal revenueLastMonth;

    // ── Inventory ──────────────────────────────────────────────────────────────
    private long lowStockProductCount;       // products below reorder level
    private long outOfStockCount;

    // ── Recent data (for dashboard tables/lists) ───────────────────────────────
    /** Revenue per month for the last 6 months: { "2024-01": 12500.00, ... } */
    private Map<String, BigDecimal> revenueByMonth;

    /** Top 5 products by order volume: [ { productName, quantity } ] */
    private List<TopProduct> topProducts;

    /** Order status breakdown: { "PENDING": 12, "CONFIRMED": 8, ... } */
    private Map<String, Long> ordersByStatus;

    @Data
    @Builder
    public static class TopProduct {
        private String productName;
        private long   totalQuantitySold;
        private BigDecimal totalRevenue;
    }
}
