-- Per-title encoding: marks each rendition as on/off the upper convex
-- hull of (bitrate, VMAF). A rendition is convex_hull_optimal=true when
-- no linear interpolation between two other tiers can match its VMAF at
-- equal-or-lower bitrate. NULL until VMAF has been computed and the hull
-- has been calculated. Real PTE pipelines generate many candidates per
-- title and use this to prune the ladder to ~5 optimal tiers; the demo
-- just flags the fixed ladder so the UI can show the algorithm's verdict.
ALTER TABLE renditions ADD COLUMN convex_hull_optimal BOOLEAN;
