package com.example.vod.workflow.workers;

import com.example.vod.domain.RenditionEntity;
import com.example.vod.domain.VideoAssetEntity;
import com.example.vod.media.FfmpegMediaProcessor;
import com.example.vod.media.FfmpegMediaProcessor.LadderTier;
import com.example.vod.repository.RenditionRepository;
import com.example.vod.repository.VideoAssetRepository;
import java.io.IOException;
import java.nio.file.Path;
import java.security.SecureRandom;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Component;

@Component
public class DrmWorker {

    private static final SecureRandom RANDOM = new SecureRandom();

    private final VideoAssetRepository assets;
    private final RenditionRepository renditions;
    private final FfmpegMediaProcessor ffmpeg;

    public DrmWorker(VideoAssetRepository assets,
                     RenditionRepository renditions,
                     FfmpegMediaProcessor ffmpeg) {
        this.assets = assets;
        this.renditions = renditions;
        this.ffmpeg = ffmpeg;
    }

    public void run(UUID assetId) throws IOException {
        VideoAssetEntity asset = assets.findById(assetId).orElseThrow();
        if (asset.getPackageDir() == null) {
            throw new IllegalStateException("no packaged tiers for asset " + assetId);
        }
        List<RenditionEntity> rows = renditions.findByAssetIdOrderByVideoBitrateKbpsAsc(assetId);
        if (rows.isEmpty()) {
            throw new IllegalStateException("no renditions to encrypt for asset " + assetId);
        }

        // One content key + IV shared across every tier so the player can
        // switch tier mid-playback without a fresh license fetch.
        byte[] keyBytes = new byte[16];
        RANDOM.nextBytes(keyBytes);
        byte[] ivBytes = new byte[16];
        RANDOM.nextBytes(ivBytes);

        for (RenditionEntity r : rows) {
            LadderTier t = new LadderTier(
                r.getTierLabel(), r.getWidth(), r.getHeight(),
                r.getVideoBitrateKbps(), r.getAudioBitrateKbps());
            Path plain = ffmpeg.assetDir(assetId).resolve("program")
                    .resolve(t.label()).resolve("master.m3u8");
            ffmpeg.encryptHlsTier(assetId, plain, t, keyBytes, ivBytes);
        }

        List<LadderTier> tiers = rows.stream()
            .map(r -> new LadderTier(r.getTierLabel(), r.getWidth(), r.getHeight(),
                    r.getVideoBitrateKbps(), r.getAudioBitrateKbps()))
            .toList();
        ffmpeg.generateLadderMasterPlaylist(assetId, tiers);

        // keyId is an opaque handle; the AES key never leaves the filesystem.
        VideoAssetEntity fresh = assets.findById(assetId).orElseThrow();
        fresh.setDrmKeyId(UUID.randomUUID().toString());
        assets.save(fresh);
    }
}
