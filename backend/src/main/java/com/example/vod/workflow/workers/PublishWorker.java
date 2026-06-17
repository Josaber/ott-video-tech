package com.example.vod.workflow.workers;

import com.example.vod.domain.AssetStatus;
import com.example.vod.domain.VideoAssetEntity;
import com.example.vod.media.FfmpegMediaProcessor;
import com.example.vod.repository.VideoAssetRepository;
import java.nio.file.Path;
import java.util.UUID;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class PublishWorker {

    private final VideoAssetRepository assets;
    private final FfmpegMediaProcessor ffmpeg;

    public PublishWorker(VideoAssetRepository assets, FfmpegMediaProcessor ffmpeg) {
        this.assets = assets;
        this.ffmpeg = ffmpeg;
    }

    @Transactional
    public void run(UUID assetId) {
        VideoAssetEntity asset = assets.findById(assetId).orElseThrow();
        Path drmManifest = ffmpeg.assetDir(assetId).resolve("drm").resolve("master.m3u8");
        asset.setPlaybackPath(drmManifest.toString());
        asset.setStatus(AssetStatus.PUBLISHED);
        assets.save(asset);
    }
}
