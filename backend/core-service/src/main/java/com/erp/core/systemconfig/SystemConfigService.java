package com.erp.core.systemconfig;

import com.erp.core.audit.AuditService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * SystemConfigService – manages the dynamic configuration store.
 *
 * The config map is used by the Angular frontend to:
 * - Apply the correct theme colors
 * - Render the correct logo and company name
 * - Enable/disable modules in the sidebar
 */
@Service
@RequiredArgsConstructor
public class SystemConfigService {

    private final SystemConfigRepository configRepository;
    private final AuditService           auditService;

    /** Returns all config entries for a tenant as a flat key→value map. */
    @Transactional(readOnly = true)
    public Map<String, String> getConfigMap(String tenantId) {
        return configRepository.findByTenantId(tenantId)
                .stream()
                .collect(Collectors.toMap(
                        SystemConfig::getConfigKey,
                        sc -> sc.getConfigValue() != null ? sc.getConfigValue() : ""
                ));
    }

    /** Returns all config entries (full objects) for a tenant. */
    @Transactional(readOnly = true)
    public List<SystemConfig> getAll(String tenantId) {
        return configRepository.findByTenantId(tenantId);
    }

    /** Returns only the public-facing config (safe to expose to non-admins). */
    @Transactional(readOnly = true)
    public Map<String, String> getPublicConfig(String tenantId) {
        return configRepository.findByTenantIdAndIsPublicTrue(tenantId)
                .stream()
                .collect(Collectors.toMap(
                        SystemConfig::getConfigKey,
                        sc -> sc.getConfigValue() != null ? sc.getConfigValue() : ""
                ));
    }

    /** Create or update a single config key. */
    @Transactional
    public SystemConfig upsert(String tenantId, SystemConfig incoming) {
        SystemConfig config = configRepository
                .findByTenantIdAndConfigKey(tenantId, incoming.getConfigKey())
                .orElse(SystemConfig.builder()
                        .tenantId(tenantId)
                        .configKey(incoming.getConfigKey())
                        .build());

        String oldValue = config.getConfigValue();
        config.setConfigValue(incoming.getConfigValue());
        config.setConfigType(incoming.getConfigType());
        config.setLabel(incoming.getLabel());
        config.setDescription(incoming.getDescription());
        config.setPublic(incoming.isPublic());

        SystemConfig saved = configRepository.save(config);

        // Audit every config change
        auditService.log("SystemConfig",
                tenantId + ":" + incoming.getConfigKey(),
                "CONFIG_CHANGE",
                oldValue,
                incoming.getConfigValue(),
                tenantId);
        return saved;
    }

    /** Bulk save a map of key→value pairs (e.g. from a theme editor). */
    @Transactional
    public void bulkUpsert(String tenantId, Map<String, String> values) {
        values.forEach((key, value) -> {
            SystemConfig sc = configRepository
                    .findByTenantIdAndConfigKey(tenantId, key)
                    .orElse(SystemConfig.builder()
                            .tenantId(tenantId)
                            .configKey(key)
                            .build());
            String oldValue = sc.getConfigValue();
            sc.setConfigValue(value);
            configRepository.save(sc);
            auditService.log("SystemConfig", tenantId + ":" + key,
                    "CONFIG_CHANGE", oldValue, value, tenantId);
        });
    }

    @Transactional
    public void delete(Long id, String tenantId) {
        configRepository.findById(id).ifPresent(sc -> {
            if (!sc.getTenantId().equals(tenantId)) {
                throw new SecurityException("Tenant mismatch");
            }
            configRepository.delete(sc);
            auditService.log("SystemConfig", String.valueOf(id),
                    "DELETE", sc.getConfigValue(), null, tenantId);
        });
    }
}
