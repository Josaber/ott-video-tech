package com.example.vod.workflow.activities;

import com.example.vod.domain.JobStage;
import com.example.vod.service.VideoWorkflowStateService;
import com.example.vod.workflow.workers.DrmWorker;
import com.example.vod.workflow.workers.PackagingWorker;
import com.example.vod.workflow.workers.PublishWorker;
import com.example.vod.workflow.workers.SsaiWorker;
import com.example.vod.workflow.workers.TranscodeWorker;
import io.temporal.failure.ApplicationFailure;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component
public class PublishingActivitiesImpl implements PublishingActivities {

    private static final Logger log = LoggerFactory.getLogger(PublishingActivitiesImpl.class);

    private final VideoWorkflowStateService state;
    private final TranscodeWorker transcodeWorker;
    private final PackagingWorker packagingWorker;
    private final SsaiWorker ssaiWorker;
    private final DrmWorker drmWorker;
    private final PublishWorker publishWorker;

    public PublishingActivitiesImpl(VideoWorkflowStateService state,
                                    TranscodeWorker transcodeWorker,
                                    PackagingWorker packagingWorker,
                                    SsaiWorker ssaiWorker,
                                    DrmWorker drmWorker,
                                    PublishWorker publishWorker) {
        this.state = state;
        this.transcodeWorker = transcodeWorker;
        this.packagingWorker = packagingWorker;
        this.ssaiWorker = ssaiWorker;
        this.drmWorker = drmWorker;
        this.publishWorker = publishWorker;
    }

    @Override
    public void transcode(UUID assetId) {
        runStage(assetId, JobStage.TRANSCODE, id -> transcodeWorker.run(id));
    }

    @Override
    public void packageHls(UUID assetId) {
        runStage(assetId, JobStage.PACKAGE, id -> packagingWorker.run(id));
    }

    @Override
    public void ssai(UUID assetId) {
        runStage(assetId, JobStage.SSAI, id -> ssaiWorker.run(id));
    }

    @Override
    public void drm(UUID assetId) {
        runStage(assetId, JobStage.DRM, id -> drmWorker.run(id));
    }

    @Override
    public void publish(UUID assetId) {
        runStage(assetId, JobStage.PUBLISH, id -> publishWorker.run(id));
    }

    private void runStage(UUID assetId, JobStage stage, ThrowingConsumer<UUID> body) {
        UUID jobId = state.startStage(assetId, stage);
        try {
            body.accept(assetId);
            state.succeed(jobId, stage.name() + " ok");
        } catch (Throwable t) {
            log.error("stage {} failed for asset {}", stage, assetId, t);
            state.fail(jobId, t.getMessage());
            state.markAssetFailed(assetId);
            throw ApplicationFailure.newFailureWithCause(
                stage + " failed: " + t.getMessage(), stage.name() + "_FAILED", t);
        }
    }

    @FunctionalInterface
    private interface ThrowingConsumer<T> {
        void accept(T t) throws Exception;
    }
}
