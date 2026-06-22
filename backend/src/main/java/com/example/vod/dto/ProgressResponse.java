package com.example.vod.dto;

import java.time.Instant;
import java.util.UUID;

public record ProgressResponse(
    UUID assetId,
    long positionMs,
    Long durationMs,
    Instant updatedAt
) {}
