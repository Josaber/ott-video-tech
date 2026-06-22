package com.example.vod.workflow.workers;

import com.example.vod.domain.RenditionEntity;
import com.example.vod.domain.VideoAssetEntity;
import com.example.vod.media.FfmpegMediaProcessor;
import com.example.vod.media.FfmpegMediaProcessor.LadderTier;
import com.example.vod.repository.RenditionRepository;
import com.example.vod.repository.VideoAssetRepository;
import java.io.IOException;
import java.nio.file.Path;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Component;

@Component
public class PackagingWorker {

    private final VideoAssetRepository assets;
    private final RenditionRepository renditions;
    private final FfmpegMediaProcessor ffmpeg;

    public PackagingWorker(VideoAssetRepository assets,
                           RenditionRepository renditions,
                           FfmpegMediaProcessor ffmpeg) {
        this.assets = assets;
        this.renditions = renditions;
        this.ffmpeg = ffmpeg;
    }

    public void run(UUID assetId) throws IOException {
        VideoAssetEntity asset = assets.findById(assetId).orElseThrow();
        List<RenditionEntity> rows = renditions.findByAssetIdOrderByVideoBitrateKbpsAsc(assetId);
        if (rows.isEmpty()) {
            throw new IllegalStateException("no renditions recorded for asset " + assetId);
        }

        for (RenditionEntity r : rows) {
            // Recover the LadderTier shape from the rendition row so the
            // packager doesn't need the original ladder lookup.
            LadderTier t = new LadderTier(
                r.getTierLabel(), r.getWidth(), r.getHeight(),
                r.getVideoBitrateKbps(), r.getAudioBitrateKbps());
            Path mezz = ffmpeg.assetDir(assetId).resolve("transcoded")
                    .resolve("video_" + r.getTierLabel() + ".mp4");
            if (!java.nio.file.Files.exists(mezz)) {
                throw new IllegalStateException("missing mezzanine for tier " + r.getTierLabel());
            }
            ffmpeg.packageHlsTier(assetId, mezz, t);
        }

        VideoAssetEntity fresh = assets.findById(assetId).orElseThrow();
        // Pointer to the per-tier program dir parent — gives the DRM worker
        // a cheap existence check; per-tier paths are derived from rendition rows.
        fresh.setPackageDir(ffmpeg.assetDir(assetId).resolve("program").toString());
        assets.save(fresh);
    }
}
