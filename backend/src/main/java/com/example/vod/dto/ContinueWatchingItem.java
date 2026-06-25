package com.example.vod.dto;

import com.example.vod.domain.AssetStatus;
import java.time.Instant;
import java.util.UUID;

public record ContinueWatchingItem(
    UUID assetId,
    String title,
    AssetStatus status,
    long positionMs,
    Long durationMs,
    Instant updatedAt,
    /** Sprite sheet URL (Feature 1 trick-play). Null if asset has no sprite. */
    String spriteUrl
) {}
