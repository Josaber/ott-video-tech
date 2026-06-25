package com.example.vod.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "video_assets")
public class VideoAssetEntity {

    @Id
    private UUID id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "text")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private AssetStatus status;

    @Enumerated(EnumType.STRING)
    @Column(name = "editorial_state", nullable = false, length = 32)
    private EditorialState editorialState = EditorialState.DRAFT;

    @Column(length = 64)
    private String category;

    @Column(name = "raw_path", columnDefinition = "text")
    private String rawPath;

    @Column(name = "transcoded_path", columnDefinition = "text")
    private String transcodedPath;

    @Column(name = "package_dir", columnDefinition = "text")
    private String packageDir;

    @Column(name = "playback_path", columnDefinition = "text")
    private String playbackPath;

    @Column(name = "drm_key_id", length = 64)
    private String drmKeyId;

    @Column(name = "ad_id", length = 128)
    private String adId;

    @Column(name = "ad_duration_ms")
    private Long adDurationMs;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    public void prePersist() {
        Instant now = Instant.now();
        if (createdAt == null) createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = Instant.now();
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public AssetStatus getStatus() { return status; }
    public void setStatus(AssetStatus status) { this.status = status; }
    public EditorialState getEditorialState() { return editorialState; }
    public void setEditorialState(EditorialState editorialState) { this.editorialState = editorialState; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getRawPath() { return rawPath; }
    public void setRawPath(String rawPath) { this.rawPath = rawPath; }
    public String getTranscodedPath() { return transcodedPath; }
    public void setTranscodedPath(String transcodedPath) { this.transcodedPath = transcodedPath; }
    public String getPackageDir() { return packageDir; }
    public void setPackageDir(String packageDir) { this.packageDir = packageDir; }
    public String getPlaybackPath() { return playbackPath; }
    public void setPlaybackPath(String playbackPath) { this.playbackPath = playbackPath; }
    public String getDrmKeyId() { return drmKeyId; }
    public void setDrmKeyId(String drmKeyId) { this.drmKeyId = drmKeyId; }
    public String getAdId() { return adId; }
    public void setAdId(String adId) { this.adId = adId; }
    public Long getAdDurationMs() { return adDurationMs; }
    public void setAdDurationMs(Long adDurationMs) { this.adDurationMs = adDurationMs; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
