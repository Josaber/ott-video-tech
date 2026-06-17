package com.example.vod;

import static org.assertj.core.api.Assertions.assertThat;

import com.example.vod.config.JwtProperties;
import com.example.vod.service.LicenseUrlSigner;
import com.example.vod.service.LicenseUrlSigner.SignedLicense;
import java.time.Instant;
import java.util.UUID;
import org.junit.jupiter.api.Test;

class LicenseUrlSignerTest {

    private LicenseUrlSigner newSigner() {
        JwtProperties p = new JwtProperties();
        p.setSecret("test-secret-test-secret-test-secret-test-secret");
        return new LicenseUrlSigner(p);
    }

    @Test
    void verifiesFreshlySignedUrl() {
        LicenseUrlSigner signer = newSigner();
        UUID assetId = UUID.randomUUID();
        SignedLicense s = signer.sign(assetId, "alice", Instant.now().plusSeconds(300));
        assertThat(signer.verify(assetId, "alice", s.expiresAt(), s.nonce(), s.signature())).isTrue();
    }

    @Test
    void rejectsExpiredUrl() {
        LicenseUrlSigner signer = newSigner();
        UUID assetId = UUID.randomUUID();
        SignedLicense s = signer.sign(assetId, "alice", Instant.now().minusSeconds(10));
        assertThat(signer.verify(assetId, "alice", s.expiresAt(), s.nonce(), s.signature())).isFalse();
    }

    @Test
    void rejectsTamperedUsername() {
        LicenseUrlSigner signer = newSigner();
        UUID assetId = UUID.randomUUID();
        SignedLicense s = signer.sign(assetId, "alice", Instant.now().plusSeconds(300));
        assertThat(signer.verify(assetId, "mallory", s.expiresAt(), s.nonce(), s.signature())).isFalse();
    }

    @Test
    void rejectsReuseAcrossAssets() {
        LicenseUrlSigner signer = newSigner();
        UUID a1 = UUID.randomUUID();
        UUID a2 = UUID.randomUUID();
        SignedLicense s = signer.sign(a1, "alice", Instant.now().plusSeconds(300));
        assertThat(signer.verify(a2, "alice", s.expiresAt(), s.nonce(), s.signature())).isFalse();
    }
}
