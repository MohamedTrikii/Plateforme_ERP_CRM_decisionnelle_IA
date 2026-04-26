package com.erp.auth.controller;

import com.erp.auth.entity.Role;
import com.erp.auth.entity.User;
import com.erp.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * UserManagementController – admin endpoints for user management.
 *
 * Base path: /api/v1/users
 * All operations require ADMIN role.
 */
@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class UserManagementController {

    private final UserRepository userRepository;

    /** List all users in a tenant with pagination */
    @GetMapping
    public ResponseEntity<Page<User>> list(
            @RequestParam(required = false) String tenantId,
            Pageable pageable) {
        Page<User> users = (tenantId != null)
                ? userRepository.findByTenantId(tenantId, pageable)
                : userRepository.findAll(pageable);
        return ResponseEntity.ok(users);
    }

    /** Get a specific user */
    @GetMapping("/{id}")
    public ResponseEntity<User> getById(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found: " + id));
        return ResponseEntity.ok(user);
    }

    /** Change a user's role */
    @PatchMapping("/{id}/role")
    public ResponseEntity<User> changeRole(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found: " + id));
        user.setRole(Role.valueOf(body.get("role")));
        return ResponseEntity.ok(userRepository.save(user));
    }

    /** Enable or disable a user account */
    @PatchMapping("/{id}/toggle-active")
    public ResponseEntity<User> toggleActive(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found: " + id));
        user.setEnabled(!user.isEnabled());
        return ResponseEntity.ok(userRepository.save(user));
    }
}
