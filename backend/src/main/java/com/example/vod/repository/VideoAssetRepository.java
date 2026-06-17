package com.example.vod.repository;

import com.example.vod.domain.AssetStatus;
import com.example.vod.domain.VideoAssetEntity;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VideoAssetRepository extends JpaRepository<VideoAssetEntity, UUID> {

    List<VideoAssetEntity> findByStatusAndUpdatedAtBefore(AssetStatus status, Instant cutoff);
}
