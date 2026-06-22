-- One row per encoded rendition (ABR ladder tier).
-- Picked from a fixed ladder by source resolution at transcode time —
-- a 360p source only gets the 360p row, a 1080p source gets every tier
-- whose height ≤ source height. vmaf_score is filled by the next stage
-- (Feature 5) and stays NULL for sources VMAF can't reference (e.g.
-- assets transcoded before VMAF was wired in).
CREATE TABLE renditions (
    id                  BIGSERIAL PRIMARY KEY,
    asset_id            UUID NOT NULL REFERENCES video_assets(id) ON DELETE CASCADE,
    tier_label          VARCHAR(16) NOT NULL,
    width               INT NOT NULL,
    height              INT NOT NULL,
    video_bitrate_kbps  INT NOT NULL,
    audio_bitrate_kbps  INT NOT NULL,
    vmaf_score          NUMERIC(5,2),
    created_at          TIMESTAMP NOT NULL,
    UNIQUE(asset_id, tier_label)
);

CREATE INDEX idx_renditions_asset ON renditions(asset_id);
