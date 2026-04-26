package com.erp.auth.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

/**
 * User entity – represents an authenticated principal in the ERP system.
 * Implements Spring Security's UserDetails for seamless integration.
 *
 * Multi-tenant: the `tenantId` field ties each user to a specific company/tenant.
 */
@Entity
@Table(name = "users",
       uniqueConstraints = {
           @UniqueConstraint(name = "uk_users_email", columnNames = "email"),
           @UniqueConstraint(name = "uk_users_username", columnNames = "username")
       })
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Unique login identifier */
    @Column(nullable = false, length = 50)
    private String username;

    /** Contact email (used for notifications and password reset) */
    @Column(nullable = false, length = 100)
    private String email;

    /** BCrypt-hashed password – never stored in plain text */
    @Column(nullable = false)
    private String password;

    /** User's display name */
    @Column(name = "full_name", length = 120)
    private String fullName;

    /** Role-based access control */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Role role;

    /**
     * Tenant identifier – supports multi-tenant deployments.
     * All data queries are scoped by this value.
     */
    @Column(name = "tenant_id", length = 50)
    private String tenantId;

    /** Whether this account is active */
    @Column(nullable = false)
    @Builder.Default
    private boolean enabled = true;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // ── UserDetails contract ─────────────────────────────────────────────────

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // Prefix "ROLE_" follows Spring Security naming convention
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    @Override
    public boolean isAccountNonExpired()  { return true; }

    @Override
    public boolean isAccountNonLocked()   { return true; }

    @Override
    public boolean isCredentialsNonExpired() { return true; }
}
