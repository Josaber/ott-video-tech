package com.example.vod.service;

import com.example.vod.domain.RenditionEntity;
import com.example.vod.repository.RenditionRepository;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

/**
 * Per-title encoding (PTE) ladder selection.
 *
 * For a set of rendition candidates with measured (bitrate, VMAF) points,
 * computes the UPPER convex hull — the points where no linear blend of
 * other points reaches the same VMAF at equal-or-lower bitrate. Tiers on
 * the hull are "Pareto-optimal under interpolation"; tiers off it are
 * dominated and could be dropped without hurting the overall
 * rate-distortion frontier.
 *
 * Real PTE pipelines (Netflix-style) generate many more candidates per
 * title (multiple presets / GOPs per resolution) and use this to prune
 * to ~5 optimal tiers. The demo uses a fixed 4-tier ladder, so usually
 * every tier ends up on the hull — but the UI surfaces the verdict so
 * the algorithm itself is visible.
 *
 * Sort-by-bitrate-ascending + Andrew's monotone chain upper hull: pop
 * the previous tier from the hull stack while the consecutive triple
 * makes a non-strictly-right turn (cross product ≥ 0). For monotone-
 * increasing VMAF data with diminishing returns, this matches "lies on
 * or above the line between neighbors".
 */
@Service
public class ConvexHullLadder {

    private static final Logger log = LoggerFactory.getLogger(ConvexHullLadder.class);

    private final RenditionRepository renditions;

    public ConvexHullLadder(RenditionRepository renditions) {
        this.renditions = renditions;
    }

    public void recomputeFor(UUID assetId) {
        List<RenditionEntity> rows = renditions.findByAssetIdOrderByVideoBitrateKbpsAsc(assetId);
        // Need VMAF on every row before the hull is meaningful.
        if (rows.stream().anyMatch(r -> r.getVmafScore() == null)) {
            log.debug("skipping convex hull for {}: not all renditions scored", assetId);
            return;
        }
        List<RenditionEntity> hull = upperHull(rows);
        // Mark each rendition with the verdict and persist.
        for (RenditionEntity r : rows) {
            r.setConvexHullOptimal(hull.contains(r));
            renditions.save(r);
        }
        log.info("convex hull for {} kept {}/{} tiers: {}", assetId, hull.size(), rows.size(),
            hull.stream().map(RenditionEntity::getTierLabel).toList());
    }

    private static List<RenditionEntity> upperHull(List<RenditionEntity> sortedByBitrate) {
        List<RenditionEntity> stack = new ArrayList<>();
        for (RenditionEntity p : sortedByBitrate) {
            while (stack.size() >= 2) {
                RenditionEntity a = stack.get(stack.size() - 2);
                RenditionEntity b = stack.get(stack.size() - 1);
                if (cross(a, b, p) >= 0) {
                    // b is dominated by interpolation between a and p.
                    stack.remove(stack.size() - 1);
                } else {
                    break;
                }
            }
            stack.add(p);
        }
        return stack;
    }

    // Cross product of (b - a) × (c - a) in (bitrate, VMAF) space.
    // < 0 means a→b→c is a right turn = upper-hull-friendly.
    private static double cross(RenditionEntity a, RenditionEntity b, RenditionEntity c) {
        double ax = a.getVideoBitrateKbps();
        double ay = a.getVmafScore().doubleValue();
        double bx = b.getVideoBitrateKbps();
        double by = b.getVmafScore().doubleValue();
        double cx = c.getVideoBitrateKbps();
        double cy = c.getVmafScore().doubleValue();
        return (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
    }
}
