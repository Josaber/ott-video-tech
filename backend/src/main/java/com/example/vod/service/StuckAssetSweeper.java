package com.example.vod.service;

import com.example.vod.domain.AssetStatus;
import com.example.vod.domain.JobStage;
import com.example.vod.domain.JobStatus;
import com.example.vod.domain.ProcessingJobEntity;
import com.example.vod.domain.VideoAssetEntity;
import com.example.vod.repository.ProcessingJobRepository;
import com.example.vod.repository.VideoAssetRepository;
import com.example.vod.workflow.TemporalRuntime;
import io.temporal.client.WorkflowNotFoundException;
import io.temporal.client.WorkflowStub;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
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
 * sweeper flips the status to FAILED, also asks Temporal to terminate the
 * matching workflow ID (so the remote-mode WorkflowIdReusePolicy doesn't
 * trip on a re-trigger), and stamps a synthetic job row in the timeline.
 *
 * Work is bounded per tick to app.workflow.sweep-batch-size assets so an
 * unattended box doesn't try to fail thousands of rows inside a single
 * transaction.
 */
@Component
public class StuckAssetSweeper {

    private static final Logger log = LoggerFactory.getLogger(StuckAssetSweeper.class);

    private final VideoAssetRepository assets;
    private final ProcessingJobRepository jobs;
    private final TemporalRuntime temporal;
    private final Duration stuckAfter;
    private final int batchSize;

    public StuckAssetSweeper(VideoAssetRepository assets,
                             ProcessingJobRepository jobs,
                             TemporalRuntime temporal,
                             @Value("${app.workflow.stuck-after-minutes:30}") int stuckAfterMinutes,
                             @Value("${app.workflow.sweep-batch-size:100}") int batchSize) {
        this.assets = assets;
        this.jobs = jobs;
        this.temporal = temporal;
        this.stuckAfter = Duration.ofMinutes(stuckAfterMinutes);
        this.batchSize = batchSize;
    }

    @Scheduled(fixedDelayString = "${app.workflow.sweep-interval-ms:300000}")
    @Transactional
    public void sweep() {
        Instant cutoff = Instant.now().minus(stuckAfter);
        List<VideoAssetEntity> stuck = assets.findByStatusAndUpdatedAtBeforeOrderByUpdatedAtAsc(
                AssetStatus.PROCESSING, cutoff, PageRequest.of(0, batchSize));
        for (VideoAssetEntity asset : stuck) {
            log.warn("sweeping stuck PROCESSING asset {} last updated at {}",
                    asset.getId(), asset.getUpdatedAt());
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

            terminateWorkflow(asset.getId());
        }
    }

    private void terminateWorkflow(UUID assetId) {
        String workflowId = "publish-" + assetId;
        try {
            WorkflowStub stub = temporal.client().newUntypedWorkflowStub(workflowId);
            stub.terminate("swept-by-stuck-sweeper",
                    "asset stuck > " + stuckAfter.toMinutes() + " min");
            log.info("terminated workflow {}", workflowId);
        } catch (WorkflowNotFoundException ignored) {
            // Embedded mode: the in-memory runtime forgot the workflow when the
            // JVM died. Nothing to terminate; the sweep is still correct.
        } catch (Exception e) {
            // Best effort. Even if termination fails, the asset row is now FAILED,
            // and triggerProcessing's WorkflowIdReusePolicy.ALLOW_DUPLICATE lets
            // a closed workflow's ID be reused on re-publish.
            log.warn("could not terminate workflow {}: {}", workflowId, e.getMessage());
        }
    }
}
