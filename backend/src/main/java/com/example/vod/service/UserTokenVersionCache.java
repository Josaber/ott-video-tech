package com.example.vod.service;

import com.example.vod.domain.UserEntity;
import com.example.vod.repository.UserRepository;
import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import java.time.Duration;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * Short-TTL cache for {@code users.token_version} so the JwtTokenVersionFilter
 * doesn't fire a SELECT for every authenticated request. AuthService.changePassword
 * explicitly invalidates the entry so the changing user sees instant revocation;
 * a delayed external bump (e.g. an admin force-logging-out a user via direct SQL)
 * has at most {@code app.auth.token-version-cache.ttl-seconds} of stale read.
 */
@Component
public class UserTokenVersionCache {

    private final UserRepository users;
    private final Cache<String, Long> cache;

    public UserTokenVersionCache(UserRepository users,
                                 @Value("${app.auth.token-version-cache.ttl-seconds:30}") int ttlSeconds,
                                 @Value("${app.auth.token-version-cache.max-size:10000}") int maxSize) {
        this.users = users;
        this.cache = Caffeine.newBuilder()
                .expireAfterWrite(Duration.ofSeconds(ttlSeconds))
                .maximumSize(maxSize)
                .build();
    }

    /**
     * Returns the current token_version for the user, hitting the DB only on
     * cache miss. {@link Optional#empty()} means the user does not exist —
     * caller should treat that as an unauthenticated request.
     */
    public Optional<Long> get(String username) {
        Long cached = cache.getIfPresent(username);
        if (cached != null) {
            return Optional.of(cached);
        }
        Optional<UserEntity> user = users.findByUsername(username);
        if (user.isEmpty()) {
            return Optional.empty();
        }
        long tv = user.get().getTokenVersion();
        cache.put(username, tv);
        return Optional.of(tv);
    }

    /** Drop the cached entry so the next request reads a fresh value from DB. */
    public void invalidate(String username) {
        cache.invalidate(username);
    }
}
