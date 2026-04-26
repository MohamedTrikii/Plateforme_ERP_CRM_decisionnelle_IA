package com.erp.core.customer;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * CustomerController – REST API for Customer management.
 *
 * Base path: /api/v1/customers
 * All endpoints require authentication.
 * DELETE is restricted to ADMIN/MANAGER.
 */
@RestController
@RequestMapping("/api/v1/customers")
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerService customerService;

    @GetMapping
    public ResponseEntity<Page<Customer>> list(
            @RequestParam String tenantId,
            @RequestParam(required = false) String search,
            Pageable pageable) {
        Page<Customer> result = (search != null && !search.isBlank())
                ? customerService.search(tenantId, search, pageable)
                : customerService.findAll(tenantId, pageable);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Customer> getById(
            @PathVariable Long id,
            @RequestParam String tenantId) {
        return ResponseEntity.ok(customerService.findById(id, tenantId));
    }

    @PostMapping
    public ResponseEntity<Customer> create(
            @Valid @RequestBody Customer customer) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(customerService.create(customer));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Customer> update(
            @PathVariable Long id,
            @Valid @RequestBody Customer customer) {
        return ResponseEntity.ok(customerService.update(id, customer));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<Void> delete(
            @PathVariable Long id,
            @RequestParam String tenantId) {
        customerService.delete(id, tenantId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/count")
    public ResponseEntity<Long> count(@RequestParam String tenantId) {
        return ResponseEntity.ok(customerService.count(tenantId));
    }
}
