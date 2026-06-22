package com.example.vod.web;

import com.example.vod.config.PlaybackProperties;
import com.example.vod.domain.PlaybackSessionEntity;
import com.example.vod.dto.PlaybackSessionResponse;
import com.example.vod.repository.PlaybackSessionRepository;
import com.example.vod.repository.VideoAssetRepository;
import jakarta.servlet.http.HttpServletRequest;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

/**
 * Concurrent-stream governance.
 *
 * - POST /{assetId} allocates a new session iff the user has fewer
 *   than {@code app.playback.concurrent-stream-limit} active sessions.
 *   "Active" = last heartbeat within {@code heartbeatStaleSeconds}.
 * - PUT /{sessionId}/heartbeat refreshes the timestamp.
 * - DELETE /{sessionId} releases the slot when the player tears down.
 *
 * Stale sessions are reaped both lazily (in the allocate path) and
 * actively (a small @Scheduled sweep would belong in a separate task —
 * not added in this commit; the lazy path keeps the table bounded for
 * the demo).
 */
@RestController
@RequestMapping("/api/me/playback-session")
public class PlaybackSessionController {

    private final PlaybackSessionRepository sessions;
    private final VideoAssetRepository assets;
    private final PlaybackProperties properties;

    public PlaybackSessionController(PlaybackSessionRepository sessions,
                                      VideoAssetRepository assets,
                                      PlaybackProperties properties) {
        this.sessions = sessions;
        this.assets = assets;
        this.properties = properties;
    }

    @PostMapping("/{assetId}")
    public ResponseEntity<PlaybackSessionResponse> open(@PathVariable UUID assetId,
                                                        @AuthenticationPrincipal Jwt jwt,
                                                        HttpServletRequest req) {
        if (!assets.existsById(assetId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "asset not found");
        }
        UUID uid = uidOf(jwt);
        Instant cutoff = Instant.now().minusSeconds(properties.getHeartbeatStaleSeconds());
        // Reap stale rows for THIS user before counting. Lazy GC; keeps
        // the table from growing unbounded without a separate sweeper.
        List<PlaybackSessionEntity> active = sessions.findByUserIdAndLastHeartbeatAfter(uid, cutoff);

        if (active.size() >= properties.getConcurrentStreamLimit()) {
            throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS,
                "concurrent stream limit reached (" + properties.getConcurrentStreamLimit() + ")");
        }

        PlaybackSessionEntity row = new PlaybackSessionEntity();
        row.setId(UUID.randomUUID());
        row.setUserId(uid);
        row.setAssetId(assetId);
        Instant now = Instant.now();
        row.setStartedAt(now);
        row.setLastHeartbeat(now);
        String ua = req.getHeader("User-Agent");
        row.setUserAgent(ua == null ? null : (ua.length() > 255 ? ua.substring(0, 255) : ua));
        sessions.save(row);

        return ResponseEntity.ok(new PlaybackSessionResponse(
            row.getId(), assetId, active.size() + 1, properties.getConcurrentStreamLimit()));
    }

    @PutMapping("/{sessionId}/heartbeat")
    public ResponseEntity<Void> heartbeat(@PathVariable UUID sessionId,
                                           @AuthenticationPrincipal Jwt jwt) {
        UUID uid = uidOf(jwt);
        PlaybackSessionEntity row = sessions.findById(sessionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.GONE,
                    "session evicted or never existed"));
        if (!row.getUserId().equals(uid)) {
            // Don't reveal whether the session exists for a different user.
            throw new ResponseStatusException(HttpStatus.GONE);
        }
        row.setLastHeartbeat(Instant.now());
        sessions.save(row);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{sessionId}")
    public ResponseEntity<Void> close(@PathVariable UUID sessionId,
                                      @AuthenticationPrincipal Jwt jwt) {
        UUID uid = uidOf(jwt);
        sessions.findById(sessionId).ifPresent(row -> {
            if (row.getUserId().equals(uid)) {
                sessions.delete(row);
            }
        });
        return ResponseEntity.noContent().build();
    }

    private static UUID uidOf(Jwt jwt) {
        String uid = jwt.getClaimAsString("uid");
        if (uid == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "uid claim missing");
        }
        return UUID.fromString(uid);
    }
}
