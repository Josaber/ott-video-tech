package com.example.vod.workflow.workers;

import com.example.vod.domain.VideoAssetEntity;
import com.example.vod.media.FfmpegMediaProcessor;
import com.example.vod.repository.VideoAssetRepository;
import java.io.IOException;
import java.nio.file.Path;
import java.util.UUID;
import org.springframework.stereotype.Component;

@Component
public class TranscodeWorker {

    private final VideoAssetRepository assets;
    private final FfmpegMediaProcessor ffmpeg;

    public TranscodeWorker(VideoAssetRepository assets, FfmpegMediaProcessor ffmpeg) {
        this.assets = assets;
        this.ffmpeg = ffmpeg;
    }

    public void run(UUID assetId) throws IOException {
        VideoAssetEntity asset = assets.findById(assetId).orElseThrow();
        if (asset.getRawPath() == null) {
            throw new IllegalStateException("no raw upload for asset " + assetId);
        }
        Path out = ffmpeg.transcode(assetId, Path.of(asset.getRawPath()));
        // Sprite + WebVTT for scrub-bar thumbnails. Runs in the transcode
        // stage on purpose: it shares the decoded video stream with the
        // mezzanine encode, and a failure here shouldn't take down packaging.
        try {
            ffmpeg.generateThumbnails(assetId, out);
        } catch (IOException e) {
            // Trick-play is a UX enhancement, not a publishing blocker.
            // Logged at WARN; player just falls back to the native seek bar.
            org.slf4j.LoggerFactory.getLogger(TranscodeWorker.class)
                .warn("thumbnail generation failed for asset {}: {}", assetId, e.getMessage());
        }
        VideoAssetEntity fresh = assets.findById(assetId).orElseThrow();
        fresh.setTranscodedPath(out.toString());
        assets.save(fresh);
    }
}
