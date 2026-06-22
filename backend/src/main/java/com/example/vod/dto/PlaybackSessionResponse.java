package com.example.vod.dto;

import java.util.UUID;

public record PlaybackSessionResponse(
    UUID sessionId,
    UUID assetId,
    int activeCount,
    int limit
) {}
