package com.erp.auth.security;

import com.erp.auth.entity.User;
import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

/**
 * JwtTokenProvider – responsible for:
 * 1. Generating access and refresh tokens
 * 2. Validating tokens
 * 3. Extracting claims (username, role, tenant)
 *
 * Uses HMAC-SHA256 signing (HS256) via the jjwt 0.12.x API.
 */
@Component
@Slf4j
public class JwtTokenProvider {

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.expiration}")
    private long jwtExpiration;           // e.g. 86400000 ms = 24 h

    @Value("${jwt.refresh-expiration}")
    private long refreshExpiration;       // e.g. 604800000 ms = 7 days

    // ── Token generation ─────────────────────────────────────────────────────

    /** Generate a short-lived access token containing username, role and tenant. */
    public String generateAccessToken(UserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>();

        // Embed role in the token so downstream services don't need a DB lookup
        if (userDetails.getAuthorities() != null && !userDetails.getAuthorities().isEmpty()) {
            claims.put("role", userDetails.getAuthorities().iterator().next().getAuthority());
        }

        // Embed tenantId so downstream services can enforce multi-tenant isolation
        if (userDetails instanceof User user && user.getTenantId() != null) {
            claims.put("tenantId", user.getTenantId());
        }

        return buildToken(claims, userDetails.getUsername(), jwtExpiration);
    }

    /** Generate a long-lived refresh token (minimal claims). */
    public String generateRefreshToken(UserDetails userDetails) {
        return buildToken(new HashMap<>(), userDetails.getUsername(), refreshExpiration);
    }

    private String buildToken(Map<String, Object> extraClaims, String subject, long expiration) {
        return Jwts.builder()
                .claims(extraClaims)
                .subject(subject)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSigningKey())
                .compact();
    }

    // ── Token validation ──────────────────────────────────────────────────────

    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return username.equals(userDetails.getUsername()) && !isTokenExpired(token);
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    // ── Claims extraction ─────────────────────────────────────────────────────

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public String extractRole(String token) {
        return extractClaim(token, claims -> claims.get("role", String.class));
    }

    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    // ── Signing key ───────────────────────────────────────────────────────────

    /**
     * Derives the HMAC-SHA key from the base-64-encoded secret stored in config.
     * The secret must be at least 256 bits (32 bytes) for HS256.
     */
    private SecretKey getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(jwtSecret);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
