package com.example.vod;

import static org.assertj.core.api.Assertions.assertThat;

import com.example.vod.service.NonceStore;
import java.time.Duration;
import org.junit.jupiter.api.Test;

class NonceStoreTest {

    @Test
    void firstClaimSucceedsReplayFails() {
        NonceStore store = new NonceStore();
        assertThat(store.claim("nonce-1", Duration.ofMinutes(10))).isTrue();
        assertThat(store.claim("nonce-1", Duration.ofMinutes(10))).isFalse();
    }

    @Test
    void distinctNoncesEachSucceedOnce() {
        NonceStore store = new NonceStore();
        assertThat(store.claim("a", Duration.ofMinutes(10))).isTrue();
        assertThat(store.claim("b", Duration.ofMinutes(10))).isTrue();
        assertThat(store.claim("a", Duration.ofMinutes(10))).isFalse();
        assertThat(store.claim("b", Duration.ofMinutes(10))).isFalse();
    }

    @Test
    void evictExpiredRemovesPastEntries() {
        NonceStore store = new NonceStore();
        store.claim("ephemeral", Duration.ofMillis(-1));
        store.evictExpired();
        // After eviction the nonce is forgotten so claiming again should succeed.
        assertThat(store.claim("ephemeral", Duration.ofMinutes(10))).isTrue();
    }
}
