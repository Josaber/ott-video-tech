package com.example.vod.dto;

import com.example.vod.domain.AssetStatus;
import com.example.vod.domain.VideoAssetEntity;
import java.time.Instant;
import java.util.UUID;

public record AssetResponse(
    UUID id,
    String title,
    String description,
    AssetStatus status,
    boolean rawUploaded,
    String playbackUrl,
    String drmKeyIdPreview,
    String adId,
    Long adDurationMs,
    Instant createdAt,
    Instant updatedAt
) {
    public static AssetResponse from(VideoAssetEntity e, String publicBaseUrl) {
        String playback = e.getPlaybackPath() == null
                ? null
                : publicBaseUrl + "/playback/" + e.getId() + "/master.m3u8";
        String keyPreview = e.getDrmKeyId() == null ? null
                : e.getDrmKeyId().substring(0, Math.min(8, e.getDrmKeyId().length())) + "…";
        return new AssetResponse(
            e.getId(), e.getTitle(), e.getDescription(), e.getStatus(),
            e.getRawPath() != null, playback, keyPreview,
            e.getAdId(), e.getAdDurationMs(),
            e.getCreatedAt(), e.getUpdatedAt()
        );
    }
}
