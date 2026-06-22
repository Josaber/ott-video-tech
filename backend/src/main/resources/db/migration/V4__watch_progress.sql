-- Continue-watching state. (user_id, asset_id) is the natural primary
-- key — one resume position per user per title. position_ms is the last
-- recorded playhead; duration_ms is captured opportunistically so the
-- frontend can pick a "near the end" cutoff without re-fetching duration.
CREATE TABLE watch_progress (
    user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    asset_id     UUID NOT NULL REFERENCES video_assets(id) ON DELETE CASCADE,
    position_ms  BIGINT NOT NULL,
    duration_ms  BIGINT,
    updated_at   TIMESTAMP NOT NULL,
    PRIMARY KEY (user_id, asset_id)
);

CREATE INDEX idx_watch_progress_user_updated ON watch_progress(user_id, updated_at DESC);
