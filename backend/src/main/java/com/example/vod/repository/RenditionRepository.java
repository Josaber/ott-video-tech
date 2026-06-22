package com.example.vod.repository;

import com.example.vod.domain.RenditionEntity;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RenditionRepository extends JpaRepository<RenditionEntity, Long> {
    List<RenditionEntity> findByAssetIdOrderByVideoBitrateKbpsAsc(UUID assetId);
    void deleteByAssetId(UUID assetId);
}
