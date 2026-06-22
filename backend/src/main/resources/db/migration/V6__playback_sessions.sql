-- One row per active concurrent playback. The (user_id) index is the
-- hot path: every session open counts (and culls stale) rows belonging
-- to the caller. asset_id is intentionally NOT a FK — sessions outlive
-- a deleted asset until the next sweep so we don't cascade-delete real
-- session state when an admin removes a title.
CREATE TABLE playback_sessions (
    id              UUID PRIMARY KEY,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    asset_id        UUID NOT NULL,
    started_at      TIMESTAMP NOT NULL,
    last_heartbeat  TIMESTAMP NOT NULL,
    user_agent      VARCHAR(255)
);

CREATE INDEX idx_playback_sessions_user ON playback_sessions(user_id, last_heartbeat DESC);
