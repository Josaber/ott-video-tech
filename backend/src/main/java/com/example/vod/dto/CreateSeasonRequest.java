package com.example.vod.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateSeasonRequest(
    @NotNull @Min(1) Integer seasonNumber,
    @Size(max = 255) String title
) {}
