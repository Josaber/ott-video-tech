package com.example.vod.dto;

public record LoginResponse(
    String accessToken,
    String tokenType,
    long expiresInSeconds,
    String username,
    String role
) {}
