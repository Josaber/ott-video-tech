package com.example.vod.workflow.workers;

import com.example.vod.domain.RenditionEntity;
import com.example.vod.domain.VideoAssetEntity;
import com.example.vod.media.FfmpegMediaProcessor;
import com.example.vod.media.FfmpegMediaProcessor.LadderTier;
import com.example.vod.media.FfmpegMediaProcessor.ProbeResult;
import com.example.vod.repository.RenditionRepository;
import com.example.vod.repository.VideoAssetRepository;
import java.io.IOException;
import java.nio.file.Path;
import java.time.Duration;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class TranscodeWorker {

    private final VideoAssetRepository assets;
    private final RenditionRepository renditions;
    private final FfmpegMediaProcessor ffmpeg;

    public TranscodeWorker(VideoAssetRepository assets,
                           RenditionRepository renditions,
                           FfmpegMediaProcessor ffmpeg) {
        this.assets = assets;
        this.renditions = renditions;
        this.ffmpeg = ffmpeg;
    }

    @Transactional
    public void run(UUID assetId) throws IOException {
        VideoAssetEntity asset = assets.findById(assetId).orElseThrow();
        if (asset.getRawPath() == null) {
            throw new IllegalStateException("no raw upload for asset " + assetId);
        }
        Path rawPath = Path.of(asset.getRawPath());

        // Probe once — gives us duration + source dimensions for ladder picking.
        ProbeResult probe = ffmpeg.probe(rawPath);
        Duration duration = probe.duration();
        int srcW = probe.width() > 0 ? probe.width() : 640;
        int srcH = probe.height() > 0 ? probe.height() : 360;
        List<LadderTier> tiers = ffmpeg.selectLadder(srcW, srcH);
        log().info("transcoding asset {} ({}x{}, {}s) into {} tiers: {}",
                assetId, srcW, srcH, duration.getSeconds(), tiers.size(),
                tiers.stream().map(LadderTier::label).toList());

        // Drop previously-recorded renditions before encoding — a re-publish
        // shouldn't accumulate stale rows.
        renditions.deleteByAssetId(assetId);
        renditions.flush();

        Path lowestTierMezz = null;
        for (LadderTier t : tiers) {
            Path mezz = ffmpeg.transcodeTier(assetId, rawPath, t);
            if (lowestTierMezz == null) lowestTierMezz = mezz;
            RenditionEntity row = new RenditionEntity();
            row.setAssetId(assetId);
            row.setTierLabel(t.label());
            row.setWidth(t.width());
            row.setHeight(t.height());
            row.setVideoBitrateKbps(t.vBitrateKbps());
            row.setAudioBitrateKbps(t.aBitrateKbps());
            renditions.save(row);
        }

        // Sidecars use the lowest-tier mezzanine — they're rendition-
        // agnostic (audio + subs are aligned to the source timeline) and
        // the lowest tier is cheapest to decode for sprite extraction.
        try {
            ffmpeg.generateThumbnails(assetId, lowestTierMezz);
        } catch (IOException e) {
            log().warn("thumbnail generation failed for asset {}: {}", assetId, e.getMessage());
        }
        try {
            ffmpeg.generateAltAudio(assetId, lowestTierMezz, duration);
            ffmpeg.generateSubtitles(assetId, duration);
        } catch (IOException e) {
            log().warn("multi-track generation failed for asset {}: {}", assetId, e.getMessage());
        }

        // VMAF per rendition. Scoring is multi-minute on long sources; we
        // intentionally do it here (next to where the mezzanines exist on
        // disk) but tolerate failures so the publish pipeline doesn't
        // hinge on libvmaf model availability.
        for (RenditionEntity row : renditions.findByAssetIdOrderByVideoBitrateKbpsAsc(assetId)) {
            Path mezz = ffmpeg.assetDir(assetId).resolve("transcoded")
                    .resolve("video_" + row.getTierLabel() + ".mp4");
            try {
                row.setVmafScore(ffmpeg.computeVmaf(mezz, rawPath, srcW, srcH));
                renditions.save(row);
            } catch (IOException e) {
                log().warn("VMAF failed for asset {} tier {}: {}",
                        assetId, row.getTierLabel(), e.getMessage());
            }
        }

        // Keep the legacy single-string columns pointing at the lowest tier
        // so any code still reading them resolves to something coherent.
        VideoAssetEntity fresh = assets.findById(assetId).orElseThrow();
        fresh.setTranscodedPath(lowestTierMezz.toString());
        assets.save(fresh);
    }

    private static org.slf4j.Logger log() {
        return org.slf4j.LoggerFactory.getLogger(TranscodeWorker.class);
    }
}
