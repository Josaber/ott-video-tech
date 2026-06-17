package com.example.vod.service;

import com.example.vod.domain.AssetStatus;
import com.example.vod.domain.JobStage;
import com.example.vod.domain.JobStatus;
import com.example.vod.domain.ProcessingJobEntity;
import com.example.vod.domain.VideoAssetEntity;
import com.example.vod.repository.ProcessingJobRepository;
import com.example.vod.repository.VideoAssetRepository;
import java.time.Instant;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class VideoWorkflowStateService {

    private final VideoAssetRepository assets;
    private final ProcessingJobRepository jobs;

    public VideoWorkflowStateService(VideoAssetRepository assets, ProcessingJobRepository jobs) {
        this.assets = assets;
        this.jobs = jobs;
    }

    @Transactional
    public UUID recordPending(UUID assetId, JobStage stage, String message) {
        ProcessingJobEntity job = new ProcessingJobEntity();
        job.setId(UUID.randomUUID());
        job.setAssetId(assetId);
        job.setStage(stage);
        job.setStatus(JobStatus.PENDING);
        job.setMessage(message);
        jobs.save(job);
        return job.getId();
    }

    @Transactional
    public UUID startStage(UUID assetId, JobStage stage) {
        ProcessingJobEntity job = new ProcessingJobEntity();
        job.setId(UUID.randomUUID());
        job.setAssetId(assetId);
        job.setStage(stage);
        job.setStatus(JobStatus.RUNNING);
        job.setStartedAt(Instant.now());
        job.setMessage(stage.name() + " running");
        jobs.save(job);
        return job.getId();
    }

    @Transactional
    public void succeed(UUID jobId, String message) {
        ProcessingJobEntity job = jobs.findById(jobId).orElseThrow();
        job.setStatus(JobStatus.SUCCEEDED);
        job.setMessage(message);
        job.setFinishedAt(Instant.now());
        jobs.save(job);
    }

    @Transactional
    public void fail(UUID jobId, String message) {
        ProcessingJobEntity job = jobs.findById(jobId).orElseThrow();
        job.setStatus(JobStatus.FAILED);
        String trimmed = message == null ? "" : (message.length() > 4000 ? message.substring(0, 4000) : message);
        job.setMessage(trimmed);
        job.setFinishedAt(Instant.now());
        jobs.save(job);
    }

    @Transactional
    public void markAssetProcessing(UUID assetId) {
        VideoAssetEntity asset = assets.findById(assetId).orElseThrow();
        asset.setStatus(AssetStatus.PROCESSING);
        assets.save(asset);
    }

    @Transactional
    public void markAssetFailed(UUID assetId) {
        VideoAssetEntity asset = assets.findById(assetId).orElseThrow();
        asset.setStatus(AssetStatus.FAILED);
        assets.save(asset);
    }
}
