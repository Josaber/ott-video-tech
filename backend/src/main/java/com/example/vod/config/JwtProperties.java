package com.example.vod.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.auth.jwt")
public class JwtProperties {

    private String secret = "dev-only-secret-please-rotate-in-real-deployments-aaaaaaaaaaaa";
    private String issuer = "ott-video-tech-demo";
    private int ttlHours = 24;

    public String getSecret() { return secret; }
    public void setSecret(String secret) { this.secret = secret; }

    public String getIssuer() { return issuer; }
    public void setIssuer(String issuer) { this.issuer = issuer; }

    public int getTtlHours() { return ttlHours; }
    public void setTtlHours(int ttlHours) { this.ttlHours = ttlHours; }
}
