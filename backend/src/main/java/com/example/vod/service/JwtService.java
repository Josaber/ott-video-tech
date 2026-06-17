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
import org.springframework.stereotype.Service;

/**
 * Self-signed HS256 JWT issuer. Verification is handled by Spring Security's
 * oauth2-resource-server starter via the JwtDecoder bean in SecurityConfig.
 */
@Service
public class JwtService {

    private final JwtProperties properties;

    public JwtService(JwtProperties properties) {
        this.properties = properties;
        byte[] bytes = properties.getSecret().getBytes(StandardCharsets.UTF_8);
        if (bytes.length < 32) {
            throw new IllegalStateException(
                "app.auth.jwt.secret must be at least 32 bytes for HS256 (got " + bytes.length + ")");
        }
    }

    public String issue(UserEntity user) {
        try {
            Instant now = Instant.now();
            Instant exp = now.plusSeconds(properties.getTtlHours() * 3600L);
            JWTClaimsSet claims = new JWTClaimsSet.Builder()
                    .subject(user.getUsername())
                    .issuer(properties.getIssuer())
                    .issueTime(Date.from(now))
                    .expirationTime(Date.from(exp))
                    .claim("uid", user.getId().toString())
                    .claim("role", user.getRole().name())
                    .build();
            SignedJWT signed = new SignedJWT(new JWSHeader(JWSAlgorithm.HS256), claims);
            signed.sign(new MACSigner(properties.getSecret().getBytes(StandardCharsets.UTF_8)));
            return signed.serialize();
        } catch (JOSEException e) {
            throw new IllegalStateException("failed to sign JWT", e);
        }
    }

    public long ttlSeconds() {
        return properties.getTtlHours() * 3600L;
    }
}
