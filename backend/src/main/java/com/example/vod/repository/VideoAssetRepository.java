package com.example.vod.repository;

import com.example.vod.domain.AssetStatus;
import com.example.vod.domain.VideoAssetEntity;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VideoAssetRepository extends JpaRepository<VideoAssetEntity, UUID> {

    /**
     * Bounded sweep input: caller passes a Pageable (e.g. PageRequest.of(0, 100))
     * to cap one tick's work so a long-untended box doesn't try to FAIL
     * thousands of assets in one transaction.
     */
    List<VideoAssetEntity> findByStatusAndUpdatedAtBeforeOrderByUpdatedAtAsc(
            AssetStatus status, Instant cutoff, Pageable pageable);
}
