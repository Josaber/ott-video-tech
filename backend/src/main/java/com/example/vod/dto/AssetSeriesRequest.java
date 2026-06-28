package com.example.vod.dto;

import jakarta.validation.constraints.Min;
import java.util.UUID;

/**
 * Attach an asset to a season + episode, or detach (both null).
 * episodeNumber must be unique within a season — that's enforced
 * at the DB level by ux_assets_episode_in_season.
 */
public record AssetSeriesRequest(
    UUID seasonId,
    @Min(1) Integer episodeNumber
) {}
