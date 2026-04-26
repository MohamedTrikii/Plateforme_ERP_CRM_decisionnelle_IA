package com.erp.core.systemconfig;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SystemConfigRepository extends JpaRepository<SystemConfig, Long> {

    List<SystemConfig> findByTenantId(String tenantId);

    Optional<SystemConfig> findByTenantIdAndConfigKey(String tenantId, String configKey);

    List<SystemConfig> findByTenantIdAndIsPublicTrue(String tenantId);

    void deleteByTenantIdAndConfigKey(String tenantId, String configKey);
}
