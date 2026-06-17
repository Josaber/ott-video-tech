package com.example.vod.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Separate from JwtProperties on purpose: the HMAC key that signs
 * playback license URLs is a different security boundary than the JWT
 * signing key. A leak of either should not implicitly compromise the
 * other.
 */
@ConfigurationProperties(prefix = "app.license")
public class LicenseProperties {

    private String signingSecret = "dev-only-license-signing-secret-please-rotate-aaaaaaaaaaaa";
    private int ttlMinutes = 10;

    public String getSigningSecret() { return signingSecret; }
    public void setSigningSecret(String signingSecret) { this.signingSecret = signingSecret; }

    public int getTtlMinutes() { return ttlMinutes; }
    public void setTtlMinutes(int ttlMinutes) { this.ttlMinutes = ttlMinutes; }
}
