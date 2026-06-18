package com.example.vod.repository;

import com.example.vod.domain.JobStage;
import com.example.vod.domain.JobStatus;
import com.example.vod.domain.ProcessingJobEntity;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

public interface ProcessingJobRepository extends JpaRepository<ProcessingJobEntity, UUID> {

    List<ProcessingJobEntity> findByAssetIdOrderByCreatedAtAsc(UUID assetId);

    Optional<ProcessingJobEntity> findFirstByAssetIdAndStageOrderByCreatedAtDesc(UUID assetId, JobStage stage);

    @Modifying
    @Transactional
    @Query("delete from ProcessingJobEntity j where j.status = :status and j.createdAt < :cutoff")
    int deleteByStatusAndCreatedAtBefore(@Param("status") JobStatus status, @Param("cutoff") Instant cutoff);

    @Modifying
    @Transactional
    int deleteByAssetId(UUID assetId);
}
