package com.erp.core.product;

import com.erp.core.audit.AuditService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final AuditService      auditService;

    @Transactional(readOnly = true)
    public Page<Product> findAll(String tenantId, Pageable pageable) {
        return productRepository.findByTenantId(tenantId, pageable);
    }

    @Transactional(readOnly = true)
    public Page<Product> search(String tenantId, String q, Pageable pageable) {
        return productRepository.search(tenantId, q, pageable);
    }

    @Transactional(readOnly = true)
    public Product findById(Long id, String tenantId) {
        return productRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new RuntimeException("Product not found: " + id));
    }

    @Transactional
    public Product create(Product product) {
        if (product.getSku() != null &&
            productRepository.existsBySkuAndTenantId(product.getSku(), product.getTenantId())) {
            throw new IllegalArgumentException("SKU already exists: " + product.getSku());
        }
        Product saved = productRepository.save(product);
        auditService.log("Product", String.valueOf(saved.getId()),
                "CREATE", null, saved, saved.getTenantId());
        return saved;
    }

    @Transactional
    public Product update(Long id, Product incoming) {
        Product existing = findById(id, incoming.getTenantId());
        Product oldSnapshot = copyProduct(existing);

        existing.setName(incoming.getName());
        existing.setSku(incoming.getSku());
        existing.setDescription(incoming.getDescription());
        existing.setPrice(incoming.getPrice());
        existing.setCostPrice(incoming.getCostPrice());
        existing.setCategory(incoming.getCategory());
        existing.setImageUrl(incoming.getImageUrl());
        existing.setStatus(incoming.getStatus());

        Product updated = productRepository.save(existing);
        auditService.log("Product", String.valueOf(id),
                "UPDATE", oldSnapshot, updated, incoming.getTenantId());
        return updated;
    }

    @Transactional
    public void delete(Long id, String tenantId) {
        Product existing = findById(id, tenantId);
        productRepository.delete(existing);
        auditService.log("Product", String.valueOf(id),
                "DELETE", existing, null, tenantId);
    }

    public long count(String tenantId) {
        return productRepository.countByTenantId(tenantId);
    }

    private Product copyProduct(Product p) {
        return Product.builder()
                .id(p.getId()).name(p.getName()).sku(p.getSku())
                .price(p.getPrice()).category(p.getCategory())
                .tenantId(p.getTenantId()).status(p.getStatus()).build();
    }
}
