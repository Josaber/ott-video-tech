package com.example.vod.service;

import java.time.Duration;
import java.time.Instant;
import java.util.Iterator;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * In-memory single-use nonce tracker for license URLs. claim(nonce) returns
 * true the first time a nonce is seen and false on every subsequent call,
 * so a leaked URL cannot be replayed within its TTL window even by the
 * original viewer.
 *
 * Demo-shaped: state lives in the JVM. A second backend instance behind a
 * load balancer would let the same nonce play once per node. Production
 * needs a shared store (Redis SET NX EX) or sticky sessions.
 */
@Component
public class NonceStore {

    private static final Logger log = LoggerFactory.getLogger(NonceStore.class);

    /** nonce → expiresAtEpochMillis */
    private final ConcurrentHashMap<String, Long> seen = new ConcurrentHashMap<>();

    /**
     * Try to mark nonce as used. Returns true if this is the first use
     * (the caller should accept the request), false on replay (reject).
     */
    public boolean claim(String nonce, Duration ttl) {
        long expiresAt = Instant.now().toEpochMilli() + ttl.toMillis();
        Long prior = seen.putIfAbsent(nonce, expiresAt);
        return prior == null;
    }

    @Scheduled(fixedDelayString = "${app.license.nonce-sweep-ms:60000}")
    public void evictExpired() {
        long now = Instant.now().toEpochMilli();
        int before = seen.size();
        Iterator<Map.Entry<String, Long>> it = seen.entrySet().iterator();
        while (it.hasNext()) {
            if (it.next().getValue() <= now) {
                it.remove();
            }
        }
        int evicted = before - seen.size();
        if (evicted > 0) {
            log.debug("evicted {} expired nonces, {} remain", evicted, seen.size());
        }
    }

    int size() {
        return seen.size();
    }
}
