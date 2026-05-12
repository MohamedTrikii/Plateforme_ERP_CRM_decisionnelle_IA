package com.erp.auth.service;

import com.erp.auth.dto.AuthResponse;
import com.erp.auth.dto.LoginRequest;
import com.erp.auth.dto.RegisterRequest;
import com.erp.auth.entity.User;
import com.erp.auth.repository.UserRepository;
import com.erp.auth.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * AuthService – core business logic for authentication flows:
 * - User registration
 * - Login (credential validation + JWT issuance)
 * - Token refresh
 */
@Service
@RequiredArgsConstructor
@Slf4j
@SuppressWarnings("null")
public class AuthService {

    private final UserRepository        userRepository;
    private final PasswordEncoder       passwordEncoder;
    private final JwtTokenProvider      jwtTokenProvider;
    private final AuthenticationManager authenticationManager;

    // ── Register ──────────────────────────────────────────────────────────────

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("Username already taken: " + request.getUsername());
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already registered: " + request.getEmail());
        }

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                // Hash the password before persisting
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .role(request.getRole())
                .tenantId(request.getTenantId())
                .enabled(true)
                .build();

        userRepository.save(user);
        log.info("New user registered: {} (tenant: {})", user.getUsername(), user.getTenantId());

        return buildAuthResponse(user);
    }

    // ── Login ─────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        // Delegate credential verification to Spring Security's AuthenticationManager
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(),
                        request.getPassword()
                )
        );

        User user = userRepository.findByUsername(request.getUsername())
            .orElseThrow(() -> new BadCredentialsException("Invalid username or password"));

        log.info("User logged in: {}", user.getUsername());
        return buildAuthResponse(user);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private AuthResponse buildAuthResponse(User user) {
        String accessToken  = jwtTokenProvider.generateAccessToken(user);
        String refreshToken = jwtTokenProvider.generateRefreshToken(user);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .username(user.getUsername())
                .role(user.getRole().name())
                .tenantId(user.getTenantId())
                .expiresIn(86400)   // 24 h
                .build();
    }
}
