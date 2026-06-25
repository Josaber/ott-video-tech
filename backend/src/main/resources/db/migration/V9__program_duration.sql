-- Raw program duration probed at transcode time. Stored separately from
-- the player-reported watch_progress.duration_ms because the player sees
-- the STITCHED timeline (preroll pod + program + mid-rolls); the sprite
-- sheet for trick-play and continue-watching thumbnails was generated
-- against the original mezzanine. To pick the right sprite cell we need
-- to map a stitched playhead back to program time = playhead - preroll
-- offset, capped at programDurationMs.
ALTER TABLE video_assets ADD COLUMN program_duration_ms BIGINT;
