package com.erp.core.analytics;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

/**
 * AnalyticsController – provides aggregated analytics data for charts/reports.
 *
 * All endpoints require authentication (ADMIN or MANAGER).
 *
 * GET /api/v1/analytics/summary?tenantId=acme
 * GET /api/v1/analytics/revenue?tenantId=acme&months=12
 * GET /api/v1/analytics/orders/volume?tenantId=acme&months=12
 * GET /api/v1/analytics/orders/status?tenantId=acme
 */
@RestController
@RequestMapping("/api/v1/analytics")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    /** Full analytics summary for the analytics dashboard page. */
    @GetMapping("/summary")
    public ResponseEntity<AnalyticsService.AnalyticsSummary> getSummary(
            @RequestParam String tenantId) {
        return ResponseEntity.ok(analyticsService.getSummary(tenantId));
    }

    /** Monthly revenue series – defaults to last 12 months. */
    @GetMapping("/revenue")
    public ResponseEntity<Map<String, BigDecimal>> getMonthlyRevenue(
            @RequestParam String tenantId,
            @RequestParam(defaultValue = "12") int months) {
        int safeMonths = Math.clamp(months, 1, 24);
        return ResponseEntity.ok(analyticsService.getMonthlyRevenue(tenantId, safeMonths));
    }

    /** Monthly order volume series. */
    @GetMapping("/orders/volume")
    public ResponseEntity<Map<String, Long>> getOrderVolume(
            @RequestParam String tenantId,
            @RequestParam(defaultValue = "12") int months) {
        int safeMonths = Math.clamp(months, 1, 24);
        return ResponseEntity.ok(analyticsService.getMonthlyOrderVolume(tenantId, safeMonths));
    }

    /** Order count grouped by status. */
    @GetMapping("/orders/status")
    public ResponseEntity<Map<String, Long>> getOrdersByStatus(@RequestParam String tenantId) {
        return ResponseEntity.ok(analyticsService.getOrdersByStatus(tenantId));
    }
}
