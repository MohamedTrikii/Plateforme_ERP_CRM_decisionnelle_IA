package com.erp.core.dashboard;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * DashboardController – returns aggregated KPIs for the main dashboard.
 *
 * GET /api/v1/dashboard?tenantId=acme
 */
@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping
    public ResponseEntity<DashboardStats> getStats(@RequestParam String tenantId) {
        return ResponseEntity.ok(dashboardService.getStats(tenantId));
    }
}
