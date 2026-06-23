package com.example.cdnservice.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.cdn")
public class CdnProperties {
    private String signingSecret;
    private String originBaseUrl;
    private String cmcdSinkUrl;

    public String getSigningSecret() { return signingSecret; }
    public void setSigningSecret(String s) { this.signingSecret = s; }
    public String getOriginBaseUrl() { return originBaseUrl; }
    public void setOriginBaseUrl(String s) { this.originBaseUrl = s; }
    public String getCmcdSinkUrl() { return cmcdSinkUrl; }
    public void setCmcdSinkUrl(String s) { this.cmcdSinkUrl = s; }
}
