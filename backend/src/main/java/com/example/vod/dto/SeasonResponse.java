package com.example.vod.dto;

import com.example.vod.domain.SeasonEntity;
import java.time.Instant;
import java.util.UUID;

public record SeasonResponse(
    UUID id,
    UUID seriesId,
    int seasonNumber,
    String title,
    Instant createdAt,
    Instant updatedAt
) {
    public static SeasonResponse from(SeasonEntity e) {
        return new SeasonResponse(e.getId(), e.getSeriesId(), e.getSeasonNumber(),
                e.getTitle(), e.getCreatedAt(), e.getUpdatedAt());
    }
}
