package com.erp.core.tenant;

import com.erp.core.audit.AuditService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * TenantService – manages tenant lifecycle for the SaaS platform.
 * Only ADMIN users should be able to call most of these operations.
 */
@Service
@RequiredArgsConstructor
public class TenantService {

    private static final String ENTITY_NAME = "Tenant";
    private static final String SYSTEM_USER = "system";
    private static final String TENANT_NOT_FOUND = "Tenant not found: ";

    private final TenantRepository tenantRepository;
    private final AuditService     auditService;

    @Transactional(readOnly = true)
    public Page<Tenant> findAll(@NonNull Pageable pageable) {
        return tenantRepository.findAll(pageable);
    }

    @Transactional(readOnly = true)
    public Tenant findBySlug(@NonNull String slug) {
        return tenantRepository.findBySlug(slug)
                .orElseThrow(() -> new RuntimeException(TENANT_NOT_FOUND + slug));
    }

    @Transactional(readOnly = true)
    public Tenant findById(@NonNull Long id) {
        return tenantRepository.findById(id)
                .orElseThrow(() -> new RuntimeException(TENANT_NOT_FOUND + id));
    }

    @Transactional
    public Tenant create(Tenant tenant) {
        if (tenantRepository.existsBySlug(tenant.getSlug())) {
            throw new IllegalArgumentException("Tenant slug already taken: " + tenant.getSlug());
        }
        Tenant saved = tenantRepository.save(tenant);
        auditService.log(ENTITY_NAME, saved.getSlug(), "CREATE", null, saved, SYSTEM_USER);
        return saved;
    }

    @Transactional
    public Tenant update(@NonNull Long id, Tenant incoming) {
        Tenant existing = requireTenant(id);
        Tenant old = copyTenant(existing);

        existing.setName(incoming.getName());
        existing.setContactEmail(incoming.getContactEmail());
        existing.setDomain(incoming.getDomain());
        existing.setPlanType(incoming.getPlanType());
        existing.setMaxUsers(incoming.getMaxUsers());

        Tenant saved = tenantRepository.save(existing);
        auditService.log(ENTITY_NAME, String.valueOf(id), "UPDATE", old, saved, SYSTEM_USER);
        return saved;
    }

    @Transactional
    public Tenant toggleActive(@NonNull Long id) {
        Tenant tenant = requireTenant(id);
        tenant.setActive(!tenant.isActive());
        Tenant saved = tenantRepository.save(tenant);
        auditService.log(ENTITY_NAME, String.valueOf(id),
                tenant.isActive() ? "ACTIVATE" : "DEACTIVATE", null, saved, SYSTEM_USER);
        return saved;
    }

    private Tenant requireTenant(@NonNull Long id) {
        return tenantRepository.findById(id)
                .orElseThrow(() -> new RuntimeException(TENANT_NOT_FOUND + id));
    }

    private Tenant copyTenant(Tenant t) {
        return Tenant.builder()
                .id(t.getId()).slug(t.getSlug()).name(t.getName())
                .contactEmail(t.getContactEmail()).domain(t.getDomain())
                .planType(t.getPlanType()).active(t.isActive())
                .maxUsers(t.getMaxUsers()).build();
    }
}
