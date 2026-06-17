package com.example.vod.service;

import com.example.vod.config.JwtProperties;
import com.example.vod.domain.UserEntity;
import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Service;

/**
 * Self-signed HS256 JWT issuer. Verification is handled by Spring Security's
 * oauth2-resource-server starter via the JwtDecoder bean in SecurityConfig.
 */
@Service
public class JwtService {

    private static final Logger log = LoggerFactory.getLogger(JwtService.class);
    private static final String DEFAULT_SECRET_MARKER = "dev-only-secret-please-rotate";

    private final JwtProperties properties;

    public JwtService(JwtProperties properties, Environment env) {
        this.properties = properties;
        byte[] bytes = properties.getSecret().getBytes(StandardCharsets.UTF_8);
        if (bytes.length < 32) {
            throw new IllegalStateException(
                "app.auth.jwt.secret must be at least 32 bytes for HS256 (got " + bytes.length + ")");
        }
        boolean usingDefault = properties.getSecret().contains(DEFAULT_SECRET_MARKER);
        boolean prodProfile = env.acceptsProfiles("prod", "production");
        if (usingDefault && prodProfile) {
            throw new IllegalStateException(
                "JWT secret is still the default value while spring profile=prod. "
                + "Set JWT_SECRET to a strong random string (>= 32 bytes) before booting.");
        }
        if (usingDefault) {
            log.warn("==============================================================");
            log.warn("  JWT_SECRET is the default development value.                 ");
            log.warn("  Anyone with this repository can forge tokens.                ");
            log.warn("  Set JWT_SECRET=<random>=>=32-bytes for any shared deployment.");
            log.warn("==============================================================");
        }
    }

    public String issueAccessToken(UserEntity user) {
        return sign(user, "access", accessTtlSeconds());
    }

    public String issueRefreshToken(UserEntity user) {
        return sign(user, "refresh", refreshTtlSeconds());
    }

    public long accessTtlSeconds() {
        // Short-lived: 15 minutes. Frontend calls /auth/refresh before expiry.
        return 15L * 60L;
    }

    public long refreshTtlSeconds() {
        // Long-lived: the ttlHours setting. Default 24h.
        return properties.getTtlHours() * 3600L;
    }

    private String sign(UserEntity user, String type, long ttlSeconds) {
        try {
            Instant now = Instant.now();
            Instant exp = now.plusSeconds(ttlSeconds);
            JWTClaimsSet claims = new JWTClaimsSet.Builder()
                    .subject(user.getUsername())
                    .issuer(properties.getIssuer())
                    .issueTime(Date.from(now))
                    .expirationTime(Date.from(exp))
                    .claim("uid", user.getId().toString())
                    .claim("role", user.getRole().name())
                    .claim("tv", user.getTokenVersion())
                    .claim("typ", type)
                    .build();
            SignedJWT signed = new SignedJWT(new JWSHeader(JWSAlgorithm.HS256), claims);
            signed.sign(new MACSigner(properties.getSecret().getBytes(StandardCharsets.UTF_8)));
            return signed.serialize();
        } catch (JOSEException e) {
            throw new IllegalStateException("failed to sign JWT", e);
        }
    }
}
