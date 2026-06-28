package com.example.vod.dto;

import com.example.vod.domain.AssetStatus;
import com.example.vod.domain.EditorialState;
import com.example.vod.domain.SeasonEntity;
import com.example.vod.domain.SeriesEntity;
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
    String posterUrl,
    String drmKeyIdPreview,
    String adId,
    Long adDurationMs,
    UUID seasonId,
    Integer episodeNumber,
    UUID seriesId,
    String seriesTitle,
    Integer seasonNumber,
    Instant createdAt,
    Instant updatedAt
) {
    public static AssetResponse from(VideoAssetEntity e, String publicBaseUrl) {
        return from(e, publicBaseUrl, "", null, null);
    }

    public static AssetResponse from(VideoAssetEntity e, String publicBaseUrl, String cdnBaseUrl) {
        return from(e, publicBaseUrl, cdnBaseUrl, null, null);
    }

    public static AssetResponse from(VideoAssetEntity e,
                                      String publicBaseUrl,
                                      String cdnBaseUrl,
                                      SeasonEntity season,
                                      SeriesEntity series) {
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
        String poster = e.getPlaybackPath() == null
                ? null
                : publicBaseUrl + "/playback/" + e.getId() + "/poster.jpg";
        String keyPreview = e.getDrmKeyId() == null ? null
                : e.getDrmKeyId().substring(0, Math.min(8, e.getDrmKeyId().length())) + "…";
        // Denormalized series/season fields are NULL when the asset isn't
        // attached to a season. The controller resolves these via batched
        // lookups so list responses don't do N+1.
        UUID seriesId = series == null ? null : series.getId();
        String seriesTitle = series == null ? null : series.getTitle();
        Integer seasonNumber = season == null ? null : season.getSeasonNumber();
        return new AssetResponse(
            e.getId(), e.getTitle(), e.getDescription(), e.getStatus(),
            e.getEditorialState(), e.getCategory(),
            e.getRawPath() != null, playback, thumbs, poster, keyPreview,
            e.getAdId(), e.getAdDurationMs(),
            e.getSeasonId(), e.getEpisodeNumber(),
            seriesId, seriesTitle, seasonNumber,
            e.getCreatedAt(), e.getUpdatedAt()
        );
    }
}
