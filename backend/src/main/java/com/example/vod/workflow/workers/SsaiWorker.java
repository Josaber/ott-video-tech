package com.example.vod.workflow.workers;

import com.example.vod.config.SsaiProperties;
import com.example.vod.domain.VideoAssetEntity;
import com.example.vod.repository.VideoAssetRepository;
import com.example.vod.ssai.VastClient;
import com.example.vod.ssai.VastClient.AdResponse;
import java.io.IOException;
import java.util.UUID;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * SSAI worker: calls the standalone ad-service via VAST, captures the ad's
 * HLS manifest URL and total duration onto the asset row. The actual
 * stitching happens at playback time so we don't bake stale absolute URLs
 * onto disk.
 */
@Component
public class SsaiWorker {

    private final VideoAssetRepository assets;
    private final VastClient vastClient;
    private final SsaiProperties ssaiProperties;

    public SsaiWorker(VideoAssetRepository assets, VastClient vastClient, SsaiProperties ssaiProperties) {
        this.assets = assets;
        this.vastClient = vastClient;
        this.ssaiProperties = ssaiProperties;
    }

    @Transactional
    public void run(UUID assetId) throws IOException {
        VideoAssetEntity asset = assets.findById(assetId).orElseThrow();
        AdResponse ad = vastClient.fetchAd(ssaiProperties.getAdId());
        asset.setAdId(ad.adId());
        asset.setAdDurationMs((long) ad.durationSeconds() * 1000);
        assets.save(asset);
    }
}
