package com.erp.core.product;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    Page<Product> findByTenantId(String tenantId, Pageable pageable);

    Page<Product> findByTenantIdAndCategory(String tenantId, String category, Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.tenantId = :tenantId " +
           "AND (LOWER(p.name) LIKE LOWER(CONCAT('%', :q, '%')) " +
           "OR LOWER(p.sku) LIKE LOWER(CONCAT('%', :q, '%')))")
    Page<Product> search(@Param("tenantId") String tenantId,
                         @Param("q") String q,
                         Pageable pageable);

    Optional<Product> findByIdAndTenantId(Long id, String tenantId);

    boolean existsBySkuAndTenantId(String sku, String tenantId);

    boolean existsBySkuAndTenantIdAndIdNot(String sku, String tenantId, Long id);

    long countByTenantId(String tenantId);
}
