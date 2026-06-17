package com.example.vod.repository;

import com.example.vod.domain.VideoAssetEntity;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VideoAssetRepository extends JpaRepository<VideoAssetEntity, UUID> {
}
