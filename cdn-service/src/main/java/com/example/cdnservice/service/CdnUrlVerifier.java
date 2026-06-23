package com.example.cdnservice.service;

import com.example.cdnservice.config.CdnProperties;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Base64;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.stereotype.Component;

/**
 * Verifies HMAC-SHA256 signed segment URLs minted by the origin backend.
 *
 * Signing payload is `path|exp` — the URL path under /cdn/ plus the
 * unix-seconds expiry. Anyone holding the shared secret can mint signed
 * URLs; this service merely checks. The signature is base64url-encoded
 * with no padding so it's safe to drop into a query string without
 * percent-escaping.
 */
@Component
public class CdnUrlVerifier {

    private final CdnProperties properties;

    public CdnUrlVerifier(CdnProperties properties) {
        this.properties = properties;
    }

    public boolean verify(String path, long expEpochSec, String sigBase64Url) {
        if (System.currentTimeMillis() / 1000L > expEpochSec) return false;
        if (sigBase64Url == null || sigBase64Url.isEmpty()) return false;
        String expected = sign(path, expEpochSec);
        // Constant-time compare to avoid timing oracles on the signature.
        byte[] a = expected.getBytes(StandardCharsets.US_ASCII);
        byte[] b = sigBase64Url.getBytes(StandardCharsets.US_ASCII);
        return MessageDigest.isEqual(a, b);
    }

    private String sign(String path, long exp) {
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
}
