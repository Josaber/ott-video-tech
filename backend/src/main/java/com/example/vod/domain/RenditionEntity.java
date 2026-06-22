package com.example.vod.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "renditions")
public class RenditionEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "asset_id", nullable = false)
    private UUID assetId;

    @Column(name = "tier_label", nullable = false, length = 16)
    private String tierLabel;

    @Column(nullable = false)
    private int width;

    @Column(nullable = false)
    private int height;

    @Column(name = "video_bitrate_kbps", nullable = false)
    private int videoBitrateKbps;

    @Column(name = "audio_bitrate_kbps", nullable = false)
    private int audioBitrateKbps;

    @Column(name = "vmaf_score", precision = 5, scale = 2)
    private BigDecimal vmafScore;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) createdAt = Instant.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public UUID getAssetId() { return assetId; }
    public void setAssetId(UUID assetId) { this.assetId = assetId; }
    public String getTierLabel() { return tierLabel; }
    public void setTierLabel(String tierLabel) { this.tierLabel = tierLabel; }
    public int getWidth() { return width; }
    public void setWidth(int width) { this.width = width; }
    public int getHeight() { return height; }
    public void setHeight(int height) { this.height = height; }
    public int getVideoBitrateKbps() { return videoBitrateKbps; }
    public void setVideoBitrateKbps(int videoBitrateKbps) { this.videoBitrateKbps = videoBitrateKbps; }
    public int getAudioBitrateKbps() { return audioBitrateKbps; }
    public void setAudioBitrateKbps(int audioBitrateKbps) { this.audioBitrateKbps = audioBitrateKbps; }
    public BigDecimal getVmafScore() { return vmafScore; }
    public void setVmafScore(BigDecimal vmafScore) { this.vmafScore = vmafScore; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
