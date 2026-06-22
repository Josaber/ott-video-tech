package com.example.vod.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.io.Serializable;
import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

@Entity
@Table(name = "watch_progress")
@IdClass(WatchProgressEntity.Key.class)
public class WatchProgressEntity {

    @Id
    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Id
    @Column(name = "asset_id", nullable = false)
    private UUID assetId;

    @Column(name = "position_ms", nullable = false)
    private long positionMs;

    @Column(name = "duration_ms")
    private Long durationMs;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    @PreUpdate
    public void touch() {
        updatedAt = Instant.now();
    }

    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }
    public UUID getAssetId() { return assetId; }
    public void setAssetId(UUID assetId) { this.assetId = assetId; }
    public long getPositionMs() { return positionMs; }
    public void setPositionMs(long positionMs) { this.positionMs = positionMs; }
    public Long getDurationMs() { return durationMs; }
    public void setDurationMs(Long durationMs) { this.durationMs = durationMs; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }

    public static class Key implements Serializable {
        private UUID userId;
        private UUID assetId;

        public Key() {}
        public Key(UUID userId, UUID assetId) {
            this.userId = userId;
            this.assetId = assetId;
        }

        public UUID getUserId() { return userId; }
        public void setUserId(UUID userId) { this.userId = userId; }
        public UUID getAssetId() { return assetId; }
        public void setAssetId(UUID assetId) { this.assetId = assetId; }

        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (!(o instanceof Key k)) return false;
            return Objects.equals(userId, k.userId) && Objects.equals(assetId, k.assetId);
        }
        @Override
        public int hashCode() {
            return Objects.hash(userId, assetId);
        }
    }
}
