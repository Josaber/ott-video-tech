package com.example.vod.dto;

import jakarta.validation.constraints.Size;

// Category column on video_assets is VARCHAR(64); without the @Size the
// only thing rejecting an over-long payload was the database insert, and
// only after the request had already touched the row. Reject at the
// controller so a hostile caller can't push the UI into broken-layout
// territory with a 1000-character chip either.
public record CategoryRequest(
    @Size(max = 64) String category
) {}
