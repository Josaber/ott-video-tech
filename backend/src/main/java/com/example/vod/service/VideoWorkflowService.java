package com.example.vod.service;

import com.example.vod.config.MediaProperties;
import com.example.vod.config.TemporalProperties;
import com.example.vod.domain.AssetStatus;
import com.example.vod.domain.JobStage;
import com.example.vod.domain.JobStatus;
import com.example.vod.domain.ProcessingJobEntity;
import com.example.vod.domain.VideoAssetEntity;
import com.example.vod.dto.CreateAssetRequest;
import com.example.vod.repository.ProcessingJobRepository;
import com.example.vod.repository.VideoAssetRepository;
import com.example.vod.workflow.TemporalRuntime;
import com.example.vod.workflow.VideoPublishingWorkflow;
import io.temporal.client.WorkflowClient;
import io.temporal.client.WorkflowOptions;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
public class VideoWorkflowService {

    private static final Logger log = LoggerFactory.getLogger(VideoWorkflowService.class);

    private final VideoAssetRepository assets;
    private final ProcessingJobRepository jobs;
    private final MediaProperties media;
    private final TemporalProperties temporalProperties;
    private final TemporalRuntime temporal;
    private final VideoWorkflowStateService state;

    public VideoWorkflowService(VideoAssetRepository assets,
                                ProcessingJobRepository jobs,
                                MediaProperties media,
                                TemporalProperties temporalProperties,
                                TemporalRuntime temporal,
                                VideoWorkflowStateService state) {
        this.assets = assets;
        this.jobs = jobs;
        this.media = media;
        this.temporalProperties = temporalProperties;
        this.temporal = temporal;
        this.state = state;
    }

    @Transactional
    public VideoAssetEntity create(CreateAssetRequest req) {
        VideoAssetEntity asset = new VideoAssetEntity();
        asset.setId(UUID.randomUUID());
        asset.setTitle(req.title());
        asset.setDescription(req.description());
        asset.setStatus(AssetStatus.UNPUBLISHED);
        return assets.save(asset);
    }

    public List<VideoAssetEntity> list() {
        return assets.findAll();
    }

    public VideoAssetEntity get(UUID id) {
        return assets.findById(id).orElseThrow();
    }

    public List<ProcessingJobEntity> jobs(UUID assetId) {
        return jobs.findByAssetIdOrderByCreatedAtAsc(assetId);
    }

    @Transactional
    public VideoAssetEntity upload(UUID assetId, MultipartFile file) throws IOException {
        VideoAssetEntity asset = assets.findById(assetId).orElseThrow();
        Path dir = Path.of(media.getUploadDir(), assetId.toString()).toAbsolutePath().normalize();
        Files.createDirectories(dir);
        String name = file.getOriginalFilename();
        if (name == null || name.isBlank()) name = "raw.bin";
        Path raw = dir.resolve(sanitize(name));
        try (var in = file.getInputStream()) {
            Files.copy(in, raw, StandardCopyOption.REPLACE_EXISTING);
        }
        asset.setRawPath(raw.toString());
        assets.save(asset);

        ProcessingJobEntity job = new ProcessingJobEntity();
        job.setId(UUID.randomUUID());
        job.setAssetId(assetId);
        job.setStage(JobStage.UPLOAD);
        job.setStatus(JobStatus.SUCCEEDED);
        job.setStartedAt(Instant.now());
        job.setFinishedAt(Instant.now());
        job.setMessage("uploaded " + file.getSize() + " bytes");
        jobs.save(job);

        return asset;
    }

    public void triggerProcessing(UUID assetId) {
        VideoAssetEntity asset = assets.findById(assetId).orElseThrow();
        if (asset.getRawPath() == null) {
            throw new IllegalStateException("upload raw video before processing");
        }
        state.markAssetProcessing(assetId);

        WorkflowClient client = temporal.client();
        VideoPublishingWorkflow workflow = client.newWorkflowStub(
            VideoPublishingWorkflow.class,
            WorkflowOptions.newBuilder()
                .setTaskQueue(temporalProperties.getTaskQueue())
                .setWorkflowId("publish-" + assetId)
                .build());
        WorkflowClient.start(workflow::publish, assetId);
        log.info("started VideoPublishingWorkflow for asset {}", assetId);
    }

    private static String sanitize(String name) {
        return name.replaceAll("[^A-Za-z0-9._-]", "_");
    }
}
