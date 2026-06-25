package com.example.vod.dto;

import com.example.vod.domain.AssetStatus;
import com.example.vod.domain.EditorialState;
import com.example.vod.domain.VideoAssetEntity;
import java.time.Instant;
import java.util.UUID;

public record AssetResponse(
    UUID id,
    String title,
    String description,
    AssetStatus status,
    EditorialState editorialState,
    String category,
    boolean rawUploaded,
    String playbackUrl,
    String thumbnailsUrl,
    String drmKeyIdPreview,
    String adId,
    Long adDurationMs,
    Instant createdAt,
    Instant updatedAt
) {
    public static AssetResponse from(VideoAssetEntity e, String publicBaseUrl) {
        return from(e, publicBaseUrl, "");
    }

    public static AssetResponse from(VideoAssetEntity e, String publicBaseUrl, String cdnBaseUrl) {
        // Manifest goes through the CDN edge so every fetch is logged
        // alongside CMCD and the same signed-URL pipeline serves both
        // .m3u8 and .ts (sig required only on segments). When CDN is
        // disabled (empty publicBaseUrl) we fall back to direct origin.
        String manifestBase = (cdnBaseUrl != null && !cdnBaseUrl.isEmpty()) ? cdnBaseUrl + "/cdn" : publicBaseUrl + "/playback";
        String playback = e.getPlaybackPath() == null
                ? null
                : manifestBase + "/" + e.getId() + "/master.m3u8";
        // Trick-play VTT stays on origin — it's small and the sprite asset
        // is fetched as a plain <img> by the player, also direct to origin.
        String thumbs = e.getPlaybackPath() == null
                ? null
                : publicBaseUrl + "/playback/" + e.getId() + "/thumbnails.vtt";
        String keyPreview = e.getDrmKeyId() == null ? null
                : e.getDrmKeyId().substring(0, Math.min(8, e.getDrmKeyId().length())) + "…";
        return new AssetResponse(
            e.getId(), e.getTitle(), e.getDescription(), e.getStatus(),
            e.getEditorialState(), e.getCategory(),
            e.getRawPath() != null, playback, thumbs, keyPreview,
            e.getAdId(), e.getAdDurationMs(),
            e.getCreatedAt(), e.getUpdatedAt()
        );
    }
}
