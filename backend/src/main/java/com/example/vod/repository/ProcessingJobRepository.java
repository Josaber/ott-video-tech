package com.example.vod.repository;

import com.example.vod.domain.JobStage;
import com.example.vod.domain.ProcessingJobEntity;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProcessingJobRepository extends JpaRepository<ProcessingJobEntity, UUID> {

    List<ProcessingJobEntity> findByAssetIdOrderByCreatedAtAsc(UUID assetId);

    Optional<ProcessingJobEntity> findFirstByAssetIdAndStageOrderByCreatedAtDesc(UUID assetId, JobStage stage);
}
