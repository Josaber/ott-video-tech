package com.example.vod.service;

import com.example.vod.config.JwtProperties;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.Base64;
import java.util.UUID;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

/**
 * Mints viewer-bound, time-bounded license URLs and verifies them on key
 * fetch. The signing key is the same JWT secret used elsewhere — fine for
 * a single-service demo; a real product would use a dedicated key.
 *
 * IMPORTANT: this is NOT a DRM system. There is no license server, no
 * device binding, no output protection, and the symmetric AES key still
 * leaves the server in cleartext (just over an authorized URL). It is a
 * stronger-than-naked key delivery channel — comparable to a Mux signed
 * URL pattern around the AES-128 key file — not Widevine / FairPlay /
 * PlayReady.
 */
public class LicenseUrlSigner {

    private final byte[] secret;

    public LicenseUrlSigner(JwtProperties properties) {
        this.secret = properties.getSecret().getBytes(StandardCharsets.UTF_8);
    }

    public SignedLicense sign(UUID assetId, String username, Instant expiresAt) {
        String nonce = randomBase64(16);
        String message = canonical(assetId, username, expiresAt.getEpochSecond(), nonce);
        String sig = base64Url(hmac(message));
        return new SignedLicense(username, expiresAt.getEpochSecond(), nonce, sig);
    }

    /** Returns true iff the signature is valid AND the URL hasn't expired. */
    public boolean verify(UUID assetId, String username, long expEpochSec, String nonce, String sig) {
        if (username == null || nonce == null || sig == null) return false;
        if (expEpochSec <= Instant.now().getEpochSecond()) return false;
        String message = canonical(assetId, username, expEpochSec, nonce);
        String expected = base64Url(hmac(message));
        return constantTimeEquals(expected, sig);
    }

    private String canonical(UUID assetId, String username, long exp, String nonce) {
        return assetId + "|" + username + "|" + exp + "|" + nonce;
    }

    private byte[] hmac(String message) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secret, "HmacSHA256"));
            return mac.doFinal(message.getBytes(StandardCharsets.UTF_8));
        } catch (Exception e) {
            throw new IllegalStateException("HMAC unavailable", e);
        }
    }

    private static String base64Url(byte[] b) {
        return Base64.getUrlEncoder().withoutPadding().encodeToString(b);
    }

    private static String randomBase64(int bytes) {
        byte[] buf = new byte[bytes];
        new java.security.SecureRandom().nextBytes(buf);
        return base64Url(buf);
    }

    private static boolean constantTimeEquals(String a, String b) {
        return MessageDigest.isEqual(a.getBytes(StandardCharsets.UTF_8), b.getBytes(StandardCharsets.UTF_8));
    }

    public record SignedLicense(String username, long expiresAt, String nonce, String signature) {
        public String toQueryString() {
            return "user=" + url(username)
                + "&exp=" + expiresAt
                + "&nonce=" + url(nonce)
                + "&sig=" + url(signature);
        }
        private static String url(String s) {
            return java.net.URLEncoder.encode(s, StandardCharsets.UTF_8);
        }
    }
}
