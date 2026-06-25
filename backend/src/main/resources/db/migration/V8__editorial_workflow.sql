-- Editorial CMS workflow + catalog category.
--
-- editorial_state is the editorial review state machine — distinct from
-- the technical "status" column (UNPUBLISHED / PROCESSING / PUBLISHED /
-- FAILED). An asset must reach READY before /process can be invoked.
-- Transitions: DRAFT → IN_REVIEW → READY, plus IN_REVIEW → DRAFT (request
-- changes) and READY → DRAFT (un-approve). Existing PUBLISHED rows are
-- backfilled to READY so they keep playing through the new gate.
--
-- category is a free-form catalog tag for discovery / collection rails
-- (drama, documentary, sports, live, other, …). NULL = uncategorised.
ALTER TABLE video_assets ADD COLUMN editorial_state VARCHAR(32) NOT NULL DEFAULT 'DRAFT';
ALTER TABLE video_assets ADD COLUMN category VARCHAR(64);

UPDATE video_assets SET editorial_state = 'READY' WHERE status = 'PUBLISHED';

CREATE INDEX idx_video_assets_category ON video_assets(category);
CREATE INDEX idx_video_assets_editorial_state ON video_assets(editorial_state);
