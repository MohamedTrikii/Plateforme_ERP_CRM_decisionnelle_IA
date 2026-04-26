package com.erp.core.stock;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StockRepository extends JpaRepository<Stock, Long> {

    Optional<Stock> findByProductIdAndTenantId(Long productId, String tenantId);

    Page<Stock> findByTenantId(String tenantId, Pageable pageable);

    /** Fetch all items at or below their reorder threshold */
    @Query("SELECT s FROM Stock s WHERE s.tenantId = :tenantId " +
           "AND (s.quantityOnHand - s.quantityReserved) <= s.reorderLevel")
    List<Stock> findLowStockItems(@Param("tenantId") String tenantId);

    long countByTenantId(String tenantId);
}
