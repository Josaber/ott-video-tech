package com.example.vod.workflow.workers;

import com.example.vod.domain.VideoAssetEntity;
import com.example.vod.media.FfmpegMediaProcessor;
import com.example.vod.media.FfmpegMediaProcessor.DrmResult;
import com.example.vod.repository.VideoAssetRepository;
import java.io.IOException;
import java.nio.file.Path;
import java.util.UUID;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class DrmWorker {

    private final VideoAssetRepository assets;
    private final FfmpegMediaProcessor ffmpeg;

    public DrmWorker(VideoAssetRepository assets, FfmpegMediaProcessor ffmpeg) {
        this.assets = assets;
        this.ffmpeg = ffmpeg;
    }

    @Transactional
    public void run(UUID assetId) throws IOException {
        VideoAssetEntity asset = assets.findById(assetId).orElseThrow();
        if (asset.getPackageDir() == null) {
            throw new IllegalStateException("no packaged manifest for asset " + assetId);
        }
        Path plain = Path.of(asset.getPackageDir()).resolve("master.m3u8");
        DrmResult result = ffmpeg.encryptHls(assetId, plain);
        asset.setDrmKeyId(result.keyId());
        assets.save(asset);
    }
}
