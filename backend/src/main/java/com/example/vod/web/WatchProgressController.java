package com.example.vod.web;

import com.example.vod.domain.WatchProgressEntity;
import com.example.vod.domain.WatchProgressEntity.Key;
import com.example.vod.dto.ProgressRequest;
import com.example.vod.dto.ProgressResponse;
import com.example.vod.repository.VideoAssetRepository;
import com.example.vod.repository.WatchProgressRepository;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

/**
 * Continue-watching state.
 *
 * GET returns 204 when the user has never started this asset — the
 * client treats that as "play from 0" without distinguishing it from
 * a non-existent row.
 *
 * PUT is upsert by the (uid, assetId) composite key. The uid is read
 * from the JWT's "uid" claim (set by JwtService), not from the
 * subject (username), so user renames don't orphan rows.
 */
@RestController
@RequestMapping("/api/me/progress")
public class WatchProgressController {

    private final WatchProgressRepository progress;
    private final VideoAssetRepository assets;
    private final com.example.vod.config.SsaiProperties ssai;

    public WatchProgressController(WatchProgressRepository progress,
                                    VideoAssetRepository assets,
                                    com.example.vod.config.SsaiProperties ssai) {
        this.progress = progress;
        this.assets = assets;
        this.ssai = ssai;
    }

    @GetMapping("/{assetId}")
    public ResponseEntity<ProgressResponse> get(@PathVariable UUID assetId,
                                                @AuthenticationPrincipal Jwt jwt) {
        UUID uid = uidOf(jwt);
        return progress.findById(new Key(uid, assetId))
                .map(p -> ResponseEntity.ok(
                        new ProgressResponse(p.getAssetId(), p.getPositionMs(),
                                p.getDurationMs(), p.getUpdatedAt())))
                .orElseGet(() -> ResponseEntity.noContent().build());
    }

    @GetMapping("/recent")
    public List<com.example.vod.dto.ContinueWatchingItem> recent(
            @AuthenticationPrincipal Jwt jwt) {
        UUID uid = uidOf(jwt);
        var page = org.springframework.data.domain.PageRequest.of(0, 10);
        return progress
            .findByUserIdAndPositionMsGreaterThanOrderByUpdatedAtDesc(uid, 0L, page)
            .stream()
            .map(p -> assets.findById(p.getAssetId())
                .map(a -> {
                    String spriteUrl = a.getPlaybackPath() == null
                        ? null
                        : "/playback/" + a.getId() + "/sprite.jpg";
                    // Map stitched-timeline playhead → program time. The
                    // saved positionMs is what the player reported (stitched:
                    // preroll pod + program + any mid-rolls); the sprite was
                    // generated against the raw mezzanine so cell indexing
                    // must be done in PROGRAM time. Subtract preroll pod
                    // duration (single value covers the pod since the demo's
                    // pod is fixed across assets) and clamp.
                    long prerollOffsetMs = a.getAdId() == null
                        ? 0L
                        : (ssai.getPrerollPod().isEmpty()
                            ? (a.getAdDurationMs() != null ? a.getAdDurationMs() : 0L)
                            : ssai.getPrerollPodDurationSeconds() * 1000L);
                    long programPosMs = Math.max(0L, p.getPositionMs() - prerollOffsetMs);
                    if (a.getProgramDurationMs() != null) {
                        programPosMs = Math.min(programPosMs, a.getProgramDurationMs());
                    }
                    Long programDurMs = a.getProgramDurationMs() != null
                        ? a.getProgramDurationMs()
                        : (p.getDurationMs() != null
                            ? Math.max(0L, p.getDurationMs() - prerollOffsetMs)
                            : null);
                    return new com.example.vod.dto.ContinueWatchingItem(
                        a.getId(), a.getTitle(), a.getStatus(),
                        programPosMs, programDurMs, p.getUpdatedAt(),
                        spriteUrl);
                })
                .orElse(null))
            .filter(java.util.Objects::nonNull)
            .filter(item -> item.status() == com.example.vod.domain.AssetStatus.PUBLISHED)
            .toList();
    }

    @PutMapping("/{assetId}")
    public ResponseEntity<ProgressResponse> put(@PathVariable UUID assetId,
                                                @RequestBody ProgressRequest body,
                                                @AuthenticationPrincipal Jwt jwt) {
        if (body == null || body.positionMs() < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "positionMs must be >= 0");
        }
        if (!assets.existsById(assetId)) {
            // Fail loudly rather than insert an FK-orphan stub. The frontend
            // shouldn't be sending progress for an asset it can't see.
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "asset not found");
        }
        UUID uid = uidOf(jwt);
        WatchProgressEntity row = progress.findById(new Key(uid, assetId))
                .orElseGet(() -> {
                    WatchProgressEntity fresh = new WatchProgressEntity();
                    fresh.setUserId(uid);
                    fresh.setAssetId(assetId);
                    return fresh;
                });
        row.setPositionMs(body.positionMs());
        if (body.durationMs() != null && body.durationMs() > 0) {
            row.setDurationMs(body.durationMs());
        }
        WatchProgressEntity saved = progress.save(row);
        return ResponseEntity.ok(new ProgressResponse(
                saved.getAssetId(), saved.getPositionMs(), saved.getDurationMs(), saved.getUpdatedAt()));
    }

    private static UUID uidOf(Jwt jwt) {
        String uid = jwt.getClaimAsString("uid");
        if (uid == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "uid claim missing");
        }
        return UUID.fromString(uid);
    }
}
