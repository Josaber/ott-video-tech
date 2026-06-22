package com.example.vod.workflow.workers;

import com.example.vod.domain.VideoAssetEntity;
import com.example.vod.media.FfmpegMediaProcessor;
import com.example.vod.media.FfmpegMediaProcessor.DrmResult;
import com.example.vod.repository.VideoAssetRepository;
import java.io.IOException;
import java.nio.file.Path;
import java.util.UUID;
import org.springframework.stereotype.Component;

@Component
public class DrmWorker {

    private final VideoAssetRepository assets;
    private final FfmpegMediaProcessor ffmpeg;

    public DrmWorker(VideoAssetRepository assets, FfmpegMediaProcessor ffmpeg) {
        this.assets = assets;
        this.ffmpeg = ffmpeg;
    }

    public void run(UUID assetId) throws IOException {
        VideoAssetEntity asset = assets.findById(assetId).orElseThrow();
        if (asset.getPackageDir() == null) {
            throw new IllegalStateException("no packaged manifest for asset " + assetId);
        }
        Path plain = Path.of(asset.getPackageDir()).resolve("master.m3u8");
        DrmResult result = ffmpeg.encryptHls(assetId, plain);
        // True multi-track master playlist wraps the encrypted program +
        // alt audio + subtitle groups. The PlaybackController's
        // /master.m3u8 endpoint serves this; /program.m3u8 keeps the
        // existing SSAI-stitch + license-rewrite behaviour for the variant.
        ffmpeg.generateTrueMasterPlaylist(assetId);
        VideoAssetEntity fresh = assets.findById(assetId).orElseThrow();
        fresh.setDrmKeyId(result.keyId());
        assets.save(fresh);
    }
}
