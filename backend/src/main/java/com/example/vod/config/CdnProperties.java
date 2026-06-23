package com.example.vod.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.cdn")
public class CdnProperties {

    /** Public base URL the player sees for CDN-served assets. Empty disables CDN rewrite. */
    private String publicBaseUrl = "";

    /** Shared HMAC secret with cdn-service. Anyone with this can mint URLs. */
    private String signingSecret = "dev-only-cdn-signing-secret-please-rotate-aaaaaaaaaaaa";

    /** Token TTL in minutes for signed segment URLs. */
    private int ttlMinutes = 10;

    public String getPublicBaseUrl() { return publicBaseUrl; }
    public void setPublicBaseUrl(String s) { this.publicBaseUrl = s; }
    public String getSigningSecret() { return signingSecret; }
    public void setSigningSecret(String s) { this.signingSecret = s; }
    public int getTtlMinutes() { return ttlMinutes; }
    public void setTtlMinutes(int v) { this.ttlMinutes = v; }

    public boolean enabled() {
        return publicBaseUrl != null && !publicBaseUrl.isEmpty();
    }
}
