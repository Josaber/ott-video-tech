package com.example.vod.workflow.workers;

import com.example.vod.domain.RenditionEntity;
import com.example.vod.domain.VideoAssetEntity;
import com.example.vod.media.FfmpegMediaProcessor;
import com.example.vod.media.FfmpegMediaProcessor.LadderTier;
import com.example.vod.media.FfmpegMediaProcessor.ProbeResult;
import com.example.vod.repository.RenditionRepository;
import com.example.vod.repository.VideoAssetRepository;
import com.example.vod.service.ConvexHullLadder;
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
    private final ConvexHullLadder hull;

    public TranscodeWorker(VideoAssetRepository assets,
                           RenditionRepository renditions,
                           FfmpegMediaProcessor ffmpeg,
                           ConvexHullLadder hull) {
        this.assets = assets;
        this.renditions = renditions;
        this.ffmpeg = ffmpeg;
        this.hull = hull;
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

        // PTE convex hull: flag each rendition as on/off the upper hull of
        // (bitrate, VMAF). No-op if any VMAF failed.
        hull.recomputeFor(assetId);

        // Forensic watermark variants at the top tier's resolution. Both
        // get packaged into program/wma and program/wmb (clear HLS); the
        // DrmWorker picks them up alongside ladder tiers and encrypts
        // with the shared content key.
        List<RenditionEntity> sortedRows = renditions.findByAssetIdOrderByVideoBitrateKbpsAsc(assetId);
        if (!sortedRows.isEmpty()) {
            RenditionEntity topRow = sortedRows.get(sortedRows.size() - 1);
            LadderTier topTier = new LadderTier(topRow.getTierLabel(),
                topRow.getWidth(), topRow.getHeight(),
                topRow.getVideoBitrateKbps(), topRow.getAudioBitrateKbps());
            try {
                Path wmA = ffmpeg.generateWatermarkVariant(assetId, rawPath, "a", 10, 10, "red", topTier);
                Path wmB = ffmpeg.generateWatermarkVariant(assetId, rawPath, "b",
                    topTier.width() - 18, 10, "lime", topTier);
                LadderTier wmaTier = new LadderTier("wma", topTier.width(), topTier.height(),
                        topTier.vBitrateKbps(), topTier.aBitrateKbps());
                LadderTier wmbTier = new LadderTier("wmb", topTier.width(), topTier.height(),
                        topTier.vBitrateKbps(), topTier.aBitrateKbps());
                ffmpeg.packageHlsTier(assetId, wmA, wmaTier);
                ffmpeg.packageHlsTier(assetId, wmB, wmbTier);
            } catch (IOException e) {
                log().warn("watermark variant generation failed for asset {}: {}",
                        assetId, e.getMessage());
            }
        }

        // Keep the legacy single-string columns pointing at the lowest tier
        // so any code still reading them resolves to something coherent.
        // programDurationMs is the RAW program length — needed for trick-play
        // sprite cell mapping in the continue-watching rail (the saved
        // playhead is in stitched timeline, sprite is in program timeline).
        VideoAssetEntity fresh = assets.findById(assetId).orElseThrow();
        fresh.setTranscodedPath(lowestTierMezz.toString());
        fresh.setProgramDurationMs(duration.toMillis());
        assets.save(fresh);
    }

    private static org.slf4j.Logger log() {
        return org.slf4j.LoggerFactory.getLogger(TranscodeWorker.class);
    }
}
