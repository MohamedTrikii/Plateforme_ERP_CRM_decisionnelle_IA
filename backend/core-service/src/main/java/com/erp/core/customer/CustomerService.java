package com.erp.core.customer;

import com.erp.core.audit.AuditService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * CustomerService – business logic for Customer management.
 * Every mutation is automatically audited.
 */
@Service
@RequiredArgsConstructor
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final AuditService       auditService;

    @Transactional(readOnly = true)
    public Page<Customer> findAll(String tenantId, Pageable pageable) {
        return customerRepository.findByTenantId(tenantId, pageable);
    }

    @Transactional(readOnly = true)
    public Page<Customer> search(String tenantId, String name, Pageable pageable) {
        return customerRepository.searchByName(tenantId, name, pageable);
    }

    @Transactional(readOnly = true)
    public Customer findById(Long id, String tenantId) {
        return customerRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new RuntimeException("Customer not found: " + id));
    }

    @Transactional
    public Customer create(Customer customer) {
        if (customerRepository.existsByEmailAndTenantId(
                customer.getEmail(), customer.getTenantId())) {
            throw new IllegalArgumentException("Email already exists in this tenant");
        }
        Customer saved = customerRepository.save(customer);
        // Audit: no previous state for CREATE
        auditService.log("Customer", String.valueOf(saved.getId()),
                "CREATE", null, saved, saved.getTenantId());
        return saved;
    }

    @Transactional
    public Customer update(Long id, Customer incoming) {
        Customer existing = findById(id, incoming.getTenantId());
        Customer oldSnapshot = copyCustomer(existing);

        existing.setName(incoming.getName());
        existing.setEmail(incoming.getEmail());
        existing.setPhone(incoming.getPhone());
        existing.setAddress(incoming.getAddress());
        existing.setCompany(incoming.getCompany());
        existing.setStatus(incoming.getStatus());

        Customer updated = customerRepository.save(existing);
        auditService.log("Customer", String.valueOf(id),
                "UPDATE", oldSnapshot, updated, incoming.getTenantId());
        return updated;
    }

    @Transactional
    public void delete(Long id, String tenantId) {
        Customer existing = findById(id, tenantId);
        customerRepository.delete(existing);
        auditService.log("Customer", String.valueOf(id),
                "DELETE", existing, null, tenantId);
    }

    public long count(String tenantId) {
        return customerRepository.countByTenantId(tenantId);
    }

    // Creates a detached copy for audit diff
    private Customer copyCustomer(Customer c) {
        return Customer.builder()
                .id(c.getId()).name(c.getName()).email(c.getEmail())
                .phone(c.getPhone()).address(c.getAddress())
                .company(c.getCompany()).tenantId(c.getTenantId())
                .status(c.getStatus()).build();
    }
}
