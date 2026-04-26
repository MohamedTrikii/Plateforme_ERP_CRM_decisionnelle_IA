package com.erp.auth.dto;

import com.erp.auth.entity.Role;
import jakarta.validation.constraints.*;
import lombok.Data;

/**
 * RegisterRequest – payload for creating a new ERP user account.
 */
@Data
public class RegisterRequest {

    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 50, message = "Username must be 3-50 characters")
    @Pattern(regexp = "^[a-zA-Z0-9_]+$", message = "Username may only contain letters, digits and underscores")
    private String username;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    private String password;

    @NotBlank(message = "Full name is required")
    private String fullName;

    /** Default role is USER; ADMIN can assign MANAGER/ADMIN roles. */
    private Role role = Role.USER;

    /** Tenant identifier (company/org). Required for multi-tenant deployments. */
    @NotBlank(message = "Tenant ID is required")
    private String tenantId;
}
