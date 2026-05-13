package com.erp.core.customer;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {

    /** Find all customers for a tenant with pagination */
    Page<Customer> findByTenantId(String tenantId, Pageable pageable);

    /** Search by name (case-insensitive) within a tenant */
    @Query("SELECT c FROM Customer c WHERE c.tenantId = :tenantId " +
           "AND LOWER(c.name) LIKE LOWER(CONCAT('%', :name, '%'))")
    Page<Customer> searchByName(@Param("tenantId") String tenantId,
                                @Param("name") String name,
                                Pageable pageable);

    Optional<Customer> findByIdAndTenantId(Long id, String tenantId);

    boolean existsByEmailIgnoreCaseAndTenantId(String email, String tenantId);

    boolean existsByEmailIgnoreCaseAndTenantIdAndIdNot(String email, String tenantId, Long id);

    long countByTenantId(String tenantId);
}
