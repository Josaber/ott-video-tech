package com.example.vod.dto;

import com.example.vod.domain.SeriesEntity;
import java.time.Instant;
import java.util.UUID;

public record SeriesResponse(
    UUID id,
    String title,
    String description,
    Instant createdAt,
    Instant updatedAt
) {
    public static SeriesResponse from(SeriesEntity e) {
        return new SeriesResponse(e.getId(), e.getTitle(), e.getDescription(),
                e.getCreatedAt(), e.getUpdatedAt());
    }
}
