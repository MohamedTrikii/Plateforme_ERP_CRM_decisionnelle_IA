package com.erp.core.systemconfig;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

/**
 * Request DTO for creating/updating a tenant system configuration entry.
 */
@Getter
@Setter
public class SystemConfigUpsertRequest {

    @NotBlank
    private String configKey;

    private String configValue;

    private SystemConfig.ConfigType configType = SystemConfig.ConfigType.TEXT;

    private String label;

    private String description;

    private boolean isPublic = true;
}
