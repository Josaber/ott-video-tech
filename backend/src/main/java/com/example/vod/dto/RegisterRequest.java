package com.example.vod.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
    @NotBlank
    @Size(min = 3, max = 64)
    @Pattern(regexp = "^[a-zA-Z0-9_.-]+$", message = "username must be alphanumeric / . _ -")
    String username,

    @NotBlank
    @Size(min = 8, max = 128, message = "password must be at least 8 characters")
    String password
) {}
