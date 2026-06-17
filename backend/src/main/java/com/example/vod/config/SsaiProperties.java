package com.example.vod.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.ssai")
public class SsaiProperties {
    private String adServiceBaseUrl = "http://127.0.0.1:8090";
    private String adId = "preroll-brand-a";

    public String getAdServiceBaseUrl() { return adServiceBaseUrl; }
    public void setAdServiceBaseUrl(String adServiceBaseUrl) { this.adServiceBaseUrl = adServiceBaseUrl; }

    public String getAdId() { return adId; }
    public void setAdId(String adId) { this.adId = adId; }
}
