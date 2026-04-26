package com.erp.core.stock;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/stock")
@RequiredArgsConstructor
public class StockController {

    private final StockService stockService;

    @GetMapping
    public ResponseEntity<Page<Stock>> list(
            @RequestParam String tenantId,
            Pageable pageable) {
        return ResponseEntity.ok(stockService.findAll(tenantId, pageable));
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<Stock> getByProduct(
            @PathVariable Long productId,
            @RequestParam String tenantId) {
        return ResponseEntity.ok(stockService.findByProduct(productId, tenantId));
    }

    @GetMapping("/low-stock")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<List<Stock>> getLowStock(@RequestParam String tenantId) {
        return ResponseEntity.ok(stockService.getLowStock(tenantId));
    }

    @PutMapping("/product/{productId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<Stock> updateStock(
            @PathVariable Long productId,
            @RequestParam String tenantId,
            @RequestBody Map<String, Integer> body) {
        Integer qty = body.get("quantity");
        if (qty == null || qty < 0) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(stockService.upsert(productId, tenantId, qty));
    }
}
