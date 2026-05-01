package com.erp.core.stock;

import com.erp.core.audit.AuditService;
import com.erp.core.product.Product;
import com.erp.core.product.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * StockService – manages inventory levels.
 * Provides reserve / release / deduct operations for the order workflow.
 */
@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class StockService {

    private final StockRepository   stockRepository;
    private final ProductRepository productRepository;
    private final AuditService      auditService;

    private static final String NOT_FOUND_MSG = "Stock not found for product: ";

    @Transactional(readOnly = true)
    public Page<Stock> findAll(String tenantId, Pageable pageable) {
        return stockRepository.findByTenantId(tenantId, pageable);
    }

    @Transactional(readOnly = true)
    public Stock findByProduct(Long productId, String tenantId) {
        return stockRepository.findByProductIdAndTenantId(productId, tenantId)
                .orElseThrow(() -> new RuntimeException(NOT_FOUND_MSG + productId));
    }

    @Transactional(readOnly = true)
    public List<Stock> getLowStock(String tenantId) {
        return stockRepository.findLowStockItems(tenantId);
    }

    /** Initialize or update stock record for a product */
    @Transactional
    public Stock upsert(Long productId, String tenantId, int quantity) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found: " + productId));

        Stock stock = stockRepository.findByProductIdAndTenantId(productId, tenantId)
                .orElseGet(() -> Stock.builder()
                        .product(product)
                        .tenantId(tenantId)
                        .build());

        int oldQty = stock.getQuantityOnHand();
        stock.setQuantityOnHand(quantity);

        Stock saved = stockRepository.save(stock);
        auditService.log("Stock", String.valueOf(saved.getId()),
                "UPDATE", oldQty, quantity, tenantId);
        return saved;
    }

    /** Reserve stock when an order is confirmed */
    @Transactional
    public void reserve(Long productId, String tenantId, int qty) {
        Stock stock = stockRepository.findByProductIdAndTenantId(productId, tenantId)
                .orElseThrow(() -> new RuntimeException(NOT_FOUND_MSG + productId));
        if (stock.getAvailableQuantity() < qty) {
            throw new IllegalStateException("Insufficient stock for product: " + productId);
        }
        stock.setQuantityReserved(stock.getQuantityReserved() + qty);
        stockRepository.save(stock);
    }

    /** Release reserved stock when an order is cancelled */
    @Transactional
    public void release(Long productId, String tenantId, int qty) {
        Stock stock = stockRepository.findByProductIdAndTenantId(productId, tenantId)
                .orElseThrow(() -> new RuntimeException(NOT_FOUND_MSG + productId));
        stock.setQuantityReserved(Math.max(0, stock.getQuantityReserved() - qty));
        stockRepository.save(stock);
    }

    /** Permanently deduct stock on delivery */
    @Transactional
    public void deduct(Long productId, String tenantId, int qty) {
        Stock stock = stockRepository.findByProductIdAndTenantId(productId, tenantId)
                .orElseThrow(() -> new RuntimeException(NOT_FOUND_MSG + productId));
        stock.setQuantityOnHand(Math.max(0, stock.getQuantityOnHand() - qty));
        stock.setQuantityReserved(Math.max(0, stock.getQuantityReserved() - qty));
        stockRepository.save(stock);
    }
}
