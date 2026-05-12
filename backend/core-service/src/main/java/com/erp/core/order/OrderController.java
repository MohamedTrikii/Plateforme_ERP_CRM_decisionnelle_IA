package com.erp.core.order;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @GetMapping
    public ResponseEntity<Page<Order>> list(
            @RequestParam("tenantId") @org.springframework.lang.NonNull String tenantId,
            @org.springframework.lang.NonNull Pageable pageable) {
        return ResponseEntity.ok(orderService.findAll(tenantId, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Order> getById(
            @PathVariable @org.springframework.lang.NonNull Long id,
            @RequestParam("tenantId") @org.springframework.lang.NonNull String tenantId) {
        return ResponseEntity.ok(orderService.findById(id, tenantId));
    }

    @PostMapping
    @SuppressWarnings("java:S4684")
    public ResponseEntity<Order> create(@Valid @RequestBody Order order) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(orderService.create(order));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<Order> updateStatus(
            @PathVariable @org.springframework.lang.NonNull Long id,
            @RequestParam("tenantId") @org.springframework.lang.NonNull String tenantId,
            @RequestParam("status") Order.OrderStatus status) {
        return ResponseEntity.ok(orderService.updateStatus(id, tenantId, status));
    }

    @GetMapping("/revenue")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<Map<String, BigDecimal>> revenue(
            @RequestParam("tenantId") String tenantId,
            @RequestParam("from") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam("to") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        BigDecimal total = orderService.getRevenue(tenantId, from, to);
        return ResponseEntity.ok(Map.of("totalRevenue", total));
    }
}
