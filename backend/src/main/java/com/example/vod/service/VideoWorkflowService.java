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
import io.temporal.api.enums.v1.WorkflowIdReusePolicy;
import io.temporal.client.WorkflowClient;
import io.temporal.client.WorkflowExecutionAlreadyStarted;
import io.temporal.client.WorkflowNotFoundException;
import io.temporal.client.WorkflowOptions;
import io.temporal.client.WorkflowStub;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Comparator;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
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
        if (file == null || file.isEmpty()) {
            throw new IllegalStateException("uploaded file is empty");
        }
        String contentType = file.getContentType();
        if (contentType == null || !(contentType.startsWith("video/") || contentType.equals("application/octet-stream"))) {
            throw new IllegalStateException("unsupported content type: " + contentType);
        }
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
        if (asset.getStatus() == AssetStatus.PROCESSING) {
            throw new IllegalStateException("asset is already being processed");
        }
        state.markAssetProcessing(assetId);

        WorkflowClient client = temporal.client();
        VideoPublishingWorkflow workflow = client.newWorkflowStub(
            VideoPublishingWorkflow.class,
            WorkflowOptions.newBuilder()
                .setTaskQueue(temporalProperties.getTaskQueue())
                .setWorkflowId("publish-" + assetId)
                .setWorkflowIdReusePolicy(WorkflowIdReusePolicy.WORKFLOW_ID_REUSE_POLICY_ALLOW_DUPLICATE)
                .build());
        try {
            WorkflowClient.start(workflow::publish, assetId);
            log.info("started VideoPublishingWorkflow for asset {}", assetId);
        } catch (WorkflowExecutionAlreadyStarted e) {
            throw new IllegalStateException("workflow already running for asset");
        }
    }

    /**
     * Delete an asset, its job history, its on-disk artifacts (upload + HLS
     * package), and ask Temporal to terminate any in-flight workflow for it.
     *
     * The transaction wraps only the DB side (jobs + asset row). The workflow
     * terminate is fire-and-forget — a slow / down Temporal cluster cannot pin
     * a request-scoped DB connection. The filesystem cleanup runs AFTER the
     * commit: if it fails the DB rows are already gone, and the next disk
     * scan or a manual rm is enough to reclaim the leaked bytes.
     */
    @Transactional
    public void delete(UUID assetId) {
        VideoAssetEntity asset = assets.findById(assetId).orElseThrow();
        String rawPath = asset.getRawPath();
        String packageDir = asset.getPackageDir();

        terminateWorkflow(assetId);
        jobs.deleteByAssetId(assetId);
        assets.delete(asset);

        deleteAssetFiles(assetId, rawPath, packageDir);
    }

    private void terminateWorkflow(UUID assetId) {
        String workflowId = "publish-" + assetId;
        CompletableFuture.runAsync(() -> {
            try {
                WorkflowStub stub = temporal.client().newUntypedWorkflowStub(workflowId);
                stub.terminate("asset-deleted", "asset " + assetId + " deleted by admin");
                log.info("terminated workflow {} for delete", workflowId);
            } catch (WorkflowNotFoundException ignored) {
                // No live workflow (embedded mode after JVM restart, or asset never published).
            } catch (Exception e) {
                log.warn("could not terminate workflow {}: {}", workflowId, e.getMessage());
            }
        });
    }

    /**
     * Defensive deletion: only purge paths that are inside the configured
     * upload / processed directories. A misconfigured row pointing at
     * /etc/something must not let an admin DELETE wipe the host.
     */
    private void deleteAssetFiles(UUID assetId, String rawPath, String packageDir) {
        Path uploadDir = Path.of(media.getUploadDir(), assetId.toString()).toAbsolutePath().normalize();
        deleteRecursivelyIfUnder(uploadDir, Path.of(media.getUploadDir()).toAbsolutePath().normalize());
        if (rawPath != null) {
            Path raw = Path.of(rawPath).toAbsolutePath().normalize();
            // Already covered by uploadDir wipe in the standard case, but in case
            // a future upload landed outside the per-asset dir we tidy it up too.
            if (!raw.startsWith(uploadDir)) {
                deleteRecursivelyIfUnder(raw, Path.of(media.getUploadDir()).toAbsolutePath().normalize());
            }
        }
        if (packageDir != null) {
            Path pkg = Path.of(packageDir).toAbsolutePath().normalize();
            deleteRecursivelyIfUnder(pkg, Path.of(media.getProcessedDir()).toAbsolutePath().normalize());
        }
    }

    private void deleteRecursivelyIfUnder(Path target, Path mustBeUnder) {
        if (!Files.exists(target)) return;
        if (!target.startsWith(mustBeUnder)) {
            log.warn("refusing to delete {} (not under {})", target, mustBeUnder);
            return;
        }
        try (var stream = Files.walk(target)) {
            stream.sorted(Comparator.reverseOrder()).forEach(p -> {
                try {
                    Files.deleteIfExists(p);
                } catch (IOException e) {
                    log.warn("could not delete {}: {}", p, e.getMessage());
                }
            });
        } catch (IOException e) {
            log.warn("could not walk {}: {}", target, e.getMessage());
        }
    }

    private static String sanitize(String name) {
        return name.replaceAll("[^A-Za-z0-9._-]", "_");
    }
}
