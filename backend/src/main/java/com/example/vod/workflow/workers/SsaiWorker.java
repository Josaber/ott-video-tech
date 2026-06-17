package com.example.vod.workflow.workers;

import com.example.vod.config.SsaiProperties;
import com.example.vod.domain.VideoAssetEntity;
import com.example.vod.repository.VideoAssetRepository;
import com.example.vod.ssai.VastClient;
import com.example.vod.ssai.VastClient.AdResponse;
import java.io.IOException;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

/**
 * SSAI worker: calls the standalone ad-service via VAST, captures the ad's
 * HLS manifest URL and total duration onto the asset row. The actual
 * stitching happens at playback time so we don't bake stale absolute URLs
 * onto disk.
 *
 * If the ad-service is unreachable or returns garbage, we proceed with no
 * ad rather than failing the entire publish. PlaybackController checks
 * asset.adId at request time and serves the unstitched DRM manifest when
 * it is null.
 */
@Component
public class SsaiWorker {

    private static final Logger log = LoggerFactory.getLogger(SsaiWorker.class);

    private final VideoAssetRepository assets;
    private final VastClient vastClient;
    private final SsaiProperties ssaiProperties;

    public SsaiWorker(VideoAssetRepository assets, VastClient vastClient, SsaiProperties ssaiProperties) {
        this.assets = assets;
        this.vastClient = vastClient;
        this.ssaiProperties = ssaiProperties;
    }

    public void run(UUID assetId) {
        VideoAssetEntity asset = assets.findById(assetId).orElseThrow();
        try {
            AdResponse ad = vastClient.fetchAd(ssaiProperties.getAdId());
            asset.setAdId(ad.adId());
            asset.setAdDurationMs((long) ad.durationSeconds() * 1000);
        } catch (IOException | RuntimeException e) {
            log.warn("ad-service unreachable, asset {} will publish without preroll: {}",
                    assetId, e.getMessage());
            asset.setAdId(null);
            asset.setAdDurationMs(null);
        }
        assets.save(asset);
    }
}
