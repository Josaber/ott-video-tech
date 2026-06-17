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
public class TranscodeWorker {

    private final VideoAssetRepository assets;
    private final FfmpegMediaProcessor ffmpeg;

    public TranscodeWorker(VideoAssetRepository assets, FfmpegMediaProcessor ffmpeg) {
        this.assets = assets;
        this.ffmpeg = ffmpeg;
    }

    @Transactional
    public void run(UUID assetId) throws IOException {
        VideoAssetEntity asset = assets.findById(assetId).orElseThrow();
        if (asset.getRawPath() == null) {
            throw new IllegalStateException("no raw upload for asset " + assetId);
        }
        Path out = ffmpeg.transcode(assetId, Path.of(asset.getRawPath()));
        asset.setTranscodedPath(out.toString());
        assets.save(asset);
    }
}
