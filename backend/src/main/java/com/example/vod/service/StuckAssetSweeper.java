package com.example.vod.service;

import com.example.vod.domain.AssetStatus;
import com.example.vod.domain.JobStage;
import com.example.vod.domain.JobStatus;
import com.example.vod.domain.ProcessingJobEntity;
import com.example.vod.domain.VideoAssetEntity;
import com.example.vod.repository.ProcessingJobRepository;
import com.example.vod.repository.VideoAssetRepository;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Recovers assets that got stuck in PROCESSING because the JVM (and the
 * embedded Temporal runtime) died mid-workflow. Without this sweeper the
 * idempotency guard in VideoWorkflowService.triggerProcessing would block
 * any retry — the asset would be unrecoverable through the API.
 *
 * An asset is considered stuck when its status is PROCESSING and updated_at
 * is older than app.workflow.stuck-after-minutes (default 30 minutes). The
 * sweeper flips the status to FAILED and stamps a synthetic job row in the
 * timeline so operators can see why.
 */
@Component
public class StuckAssetSweeper {

    private static final Logger log = LoggerFactory.getLogger(StuckAssetSweeper.class);

    private final VideoAssetRepository assets;
    private final ProcessingJobRepository jobs;
    private final Duration stuckAfter;

    public StuckAssetSweeper(VideoAssetRepository assets,
                             ProcessingJobRepository jobs,
                             @Value("${app.workflow.stuck-after-minutes:30}") int stuckAfterMinutes) {
        this.assets = assets;
        this.jobs = jobs;
        this.stuckAfter = Duration.ofMinutes(stuckAfterMinutes);
    }

    @Scheduled(fixedDelayString = "${app.workflow.sweep-interval-ms:300000}")
    @Transactional
    public void sweep() {
        Instant cutoff = Instant.now().minus(stuckAfter);
        List<VideoAssetEntity> stuck = assets.findByStatusAndUpdatedAtBefore(AssetStatus.PROCESSING, cutoff);
        for (VideoAssetEntity asset : stuck) {
            log.warn("sweeping stuck PROCESSING asset {} last updated at {}", asset.getId(), asset.getUpdatedAt());
            asset.setStatus(AssetStatus.FAILED);
            assets.save(asset);

            ProcessingJobEntity sweptJob = new ProcessingJobEntity();
            sweptJob.setId(UUID.randomUUID());
            sweptJob.setAssetId(asset.getId());
            sweptJob.setStage(JobStage.PUBLISH);
            sweptJob.setStatus(JobStatus.FAILED);
            sweptJob.setMessage("Swept by StuckAssetSweeper: PROCESSING > "
                    + stuckAfter.toMinutes() + " min (likely caused by a backend restart).");
            sweptJob.setStartedAt(asset.getUpdatedAt());
            sweptJob.setFinishedAt(Instant.now());
            jobs.save(sweptJob);
        }
    }
}
