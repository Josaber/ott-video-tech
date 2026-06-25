package com.example.vod.dto;

import com.example.vod.domain.EditorialState;

public record EditorialTransitionRequest(EditorialState target) {}
