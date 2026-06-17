CREATE TABLE video_assets (
    id              UUID PRIMARY KEY,
    title           VARCHAR(255) NOT NULL,
    description     TEXT,
    status          VARCHAR(32) NOT NULL,
    raw_path        TEXT,
    transcoded_path TEXT,
    package_dir     TEXT,
    playback_path   TEXT,
    drm_key_id      VARCHAR(64),
    ad_id           VARCHAR(128),
    ad_duration_ms  BIGINT,
    created_at      TIMESTAMP NOT NULL,
    updated_at      TIMESTAMP NOT NULL
);

CREATE TABLE processing_jobs (
    id           UUID PRIMARY KEY,
    asset_id     UUID NOT NULL REFERENCES video_assets(id) ON DELETE CASCADE,
    stage        VARCHAR(32) NOT NULL,
    status       VARCHAR(32) NOT NULL,
    message      TEXT,
    started_at   TIMESTAMP,
    finished_at  TIMESTAMP,
    created_at   TIMESTAMP NOT NULL,
    updated_at   TIMESTAMP NOT NULL
);

CREATE INDEX idx_processing_jobs_asset_id ON processing_jobs(asset_id);
CREATE INDEX idx_processing_jobs_asset_stage ON processing_jobs(asset_id, stage);
