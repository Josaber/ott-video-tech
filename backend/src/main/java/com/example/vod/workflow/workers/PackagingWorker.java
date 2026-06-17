package com.example.vod.workflow.workers;

import com.example.vod.domain.VideoAssetEntity;
import com.example.vod.media.FfmpegMediaProcessor;
import com.example.vod.repository.VideoAssetRepository;
import java.io.IOException;
import java.nio.file.Path;
import java.util.UUID;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class PackagingWorker {

    private final VideoAssetRepository assets;
    private final FfmpegMediaProcessor ffmpeg;

    public PackagingWorker(VideoAssetRepository assets, FfmpegMediaProcessor ffmpeg) {
        this.assets = assets;
        this.ffmpeg = ffmpeg;
    }

    @Transactional
    public void run(UUID assetId) throws IOException {
        VideoAssetEntity asset = assets.findById(assetId).orElseThrow();
        if (asset.getTranscodedPath() == null) {
            throw new IllegalStateException("no transcoded mp4 for asset " + assetId);
        }
        Path manifest = ffmpeg.packageHls(assetId, Path.of(asset.getTranscodedPath()));
        asset.setPackageDir(manifest.getParent().toString());
        assets.save(asset);
    }
}
