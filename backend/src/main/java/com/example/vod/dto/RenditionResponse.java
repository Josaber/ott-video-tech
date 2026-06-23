package com.example.vod.dto;

import com.example.vod.domain.RenditionEntity;
import java.math.BigDecimal;

public record RenditionResponse(
    String tier,
    int width,
    int height,
    int videoBitrateKbps,
    int audioBitrateKbps,
    BigDecimal vmafScore,
    Boolean convexHullOptimal
) {
    public static RenditionResponse from(RenditionEntity e) {
        return new RenditionResponse(
            e.getTierLabel(), e.getWidth(), e.getHeight(),
            e.getVideoBitrateKbps(), e.getAudioBitrateKbps(),
            e.getVmafScore(), e.getConvexHullOptimal()
        );
    }
}
