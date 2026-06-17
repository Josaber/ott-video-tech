-- Bumping this column invalidates every previously-issued JWT for the user.
-- AuthService.changePassword() increments it; the JwtTokenVersionFilter
-- compares the claim "tv" against the current row value on every request.
ALTER TABLE users
    ADD COLUMN token_version BIGINT NOT NULL DEFAULT 0;
