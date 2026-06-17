package com.example.vod.dto;

import com.example.vod.domain.JobStage;
import com.example.vod.domain.JobStatus;
import com.example.vod.domain.ProcessingJobEntity;
import java.time.Instant;
import java.util.UUID;

public record JobResponse(
    UUID id,
    UUID assetId,
    JobStage stage,
    JobStatus status,
    String message,
    Instant startedAt,
    Instant finishedAt,
    Instant updatedAt
) {
    public static JobResponse from(ProcessingJobEntity e) {
        return new JobResponse(
            e.getId(), e.getAssetId(), e.getStage(), e.getStatus(),
            e.getMessage(), e.getStartedAt(), e.getFinishedAt(), e.getUpdatedAt()
        );
    }
}
