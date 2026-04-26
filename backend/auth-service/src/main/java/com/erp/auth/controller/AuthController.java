package com.erp.auth.controller;

import com.erp.auth.dto.AuthResponse;
import com.erp.auth.dto.LoginRequest;
import com.erp.auth.dto.RegisterRequest;
import com.erp.auth.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * AuthController – public endpoints for authentication.
 *
 * Base path: /api/v1/auth
 * POST /register  → create a new account
 * POST /login     → authenticate and receive JWT tokens
 */
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /**
     * Register a new user.
     * Returns 201 Created with auth tokens on success.
     */
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(
            @Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Login with username + password.
     * Returns 200 OK with auth tokens on success.
     * Returns 401 Unauthorized on bad credentials (handled by Spring Security).
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    /**
     * Health check for the auth service.
     */
    @GetMapping("/ping")
    public ResponseEntity<Map<String, String>> ping() {
        return ResponseEntity.ok(Map.of("status", "Auth service is running"));
    }
}
