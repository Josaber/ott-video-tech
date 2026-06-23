package com.example.vod.service;

import com.example.vod.config.CdnProperties;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Base64;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.stereotype.Component;

/**
 * Mints HMAC-SHA256 signed CDN URLs. Mirror of cdn-service's CdnUrlVerifier;
 * the two share a secret via app.cdn.signing-secret.
 *
 * Output format: {publicBaseUrl}/cdn/{path}?exp={epochSec}&sig={base64url}
 * — path is signed as `path|exp` so the signature is bound to BOTH the
 * specific URL and the expiry. A leaked signed URL stops working after
 * its TTL and cannot be lifted onto another path.
 */
@Component
public class CdnUrlSigner {

    private final CdnProperties properties;

    public CdnUrlSigner(CdnProperties properties) {
        this.properties = properties;
    }

    public String sign(String path) {
        long exp = Instant.now().plusSeconds(properties.getTtlMinutes() * 60L).getEpochSecond();
        String sig = computeSig(path, exp);
        return properties.getPublicBaseUrl() + "/cdn/" + path
            + "?exp=" + exp + "&sig=" + sig;
    }

    private String computeSig(String path, long exp) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(
                properties.getSigningSecret().getBytes(StandardCharsets.UTF_8),
                "HmacSHA256"));
            byte[] payload = (path + "|" + exp).getBytes(StandardCharsets.UTF_8);
            byte[] raw = mac.doFinal(payload);
            return Base64.getUrlEncoder().withoutPadding().encodeToString(raw);
        } catch (Exception e) {
            throw new IllegalStateException("HMAC unavailable", e);
        }
    }

    public boolean enabled() { return properties.enabled(); }
}
