package com.erp.auth.entity;

/**
 * Role enum – defines the access levels for the ERP platform.
 * ADMIN   : Full system access, can configure system settings.
 * MANAGER : Access to reports, approvals and team management.
 * USER    : Standard operational access (create/view own data).
 */
public enum Role {
    ADMIN,
    MANAGER,
    USER
}
