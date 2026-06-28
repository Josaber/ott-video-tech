-- Series / Season metadata so up-next can advance "S2 E5 → S2 E6 → S3 E1"
-- instead of "next-published-asset", which on a tech-demo catalog where the
-- next published asset has no semantic relation is essentially noise.
--
-- Modeled as separate tables (rather than denormalized strings on the asset)
-- so episode_number can be uniquely enforced within a season, and so series
-- can be browsed / renamed without rewriting every episode row.

CREATE TABLE series (
    id UUID PRIMARY KEY,
    title TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE seasons (
    id UUID PRIMARY KEY,
    series_id UUID NOT NULL REFERENCES series(id) ON DELETE CASCADE,
    season_number INT NOT NULL,
    title TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (series_id, season_number)
);

-- Standalone assets keep season_id NULL — they're playable, they just don't
-- get an up-next card. Setting season_id NULL on cascade lets a season be
-- removed without deleting its episodes (DB-wise; the UI surfaces it as
-- "orphaned" until the admin re-attaches them).
ALTER TABLE video_assets
    ADD COLUMN season_id UUID NULL REFERENCES seasons(id) ON DELETE SET NULL,
    ADD COLUMN episode_number INT NULL;

-- Partial index: episode_number is required to be unique within a season
-- when a season is set, but multiple standalone assets (season_id NULL) are
-- fine — they all have NULL episode_number too.
CREATE UNIQUE INDEX ux_assets_episode_in_season
    ON video_assets (season_id, episode_number)
    WHERE season_id IS NOT NULL;

-- Up-next lookup hits (season_id, episode_number) constantly; same index
-- serves both the uniqueness check and the "next episode in this season"
-- range scan.
