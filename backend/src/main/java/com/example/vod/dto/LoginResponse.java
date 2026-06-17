package com.example.vod.dto;

public record LoginResponse(
    String accessToken,
    String refreshToken,
    String tokenType,
    long expiresInSeconds,
    long refreshExpiresInSeconds,
    String username,
    String role
) {}
