package com.erp.core.dashboard;

import com.erp.core.customer.CustomerRepository;
import com.erp.core.order.Order;
import com.erp.core.order.OrderRepository;
import com.erp.core.product.ProductRepository;
import com.erp.core.stock.StockService;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * DashboardController – aggregated KPIs for the dashboard widgets.
 *
 * Returns a single response with all metrics needed to populate:
 * - Revenue card
 * - Customer count card
 * - Product count card
 * - Pending orders card
 * - Low stock count card
 */
@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
public class DashboardKpiController {

    private final CustomerRepository customerRepository;
    private final ProductRepository  productRepository;
    private final OrderRepository    orderRepository;
    private final StockService       stockService;

    @GetMapping("/kpis")
    public ResponseEntity<DashboardKpi> getKpis(
            @RequestParam String tenantId,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {

        // Default to current month range
        LocalDate dateFrom = (from != null) ? from : LocalDate.now().withDayOfMonth(1);
        LocalDate dateTo   = (to   != null) ? to   : LocalDate.now();

        DashboardKpi kpi = DashboardKpi.builder()
                .totalCustomers(customerRepository.countByTenantId(tenantId))
                .totalProducts(productRepository.countByTenantId(tenantId))
                .totalOrders(orderRepository.countByTenantId(tenantId))
                .pendingOrders(orderRepository.countByTenantIdAndStatus(
                        tenantId, Order.OrderStatus.PENDING))
                .monthlyRevenue(orderRepository.sumRevenue(tenantId, dateFrom, dateTo))
                .lowStockCount(stockService.getLowStock(tenantId).size())
                .build();

        return ResponseEntity.ok(kpi);
    }

    @Data
    @Builder
    public static class DashboardKpi {
        private long       totalCustomers;
        private long       totalProducts;
        private long       totalOrders;
        private long       pendingOrders;
        private BigDecimal monthlyRevenue;
        private int        lowStockCount;
    }
}
