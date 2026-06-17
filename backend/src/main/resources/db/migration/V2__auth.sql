-- pgcrypto gives us crypt() + gen_salt('bf', N) which produce a $2a$ BCrypt hash
-- that Spring Security's BCryptPasswordEncoder.matches() accepts byte-for-byte.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE users (
    id            UUID PRIMARY KEY,
    username      VARCHAR(64) NOT NULL UNIQUE,
    password_hash VARCHAR(72) NOT NULL,  -- $2a$ output is 60 chars; 72 leaves room
    role          VARCHAR(32) NOT NULL,
    created_at    TIMESTAMP NOT NULL,
    updated_at    TIMESTAMP NOT NULL
);

-- Demo bootstrap: admin / admin. Override the password in any real environment
-- via a separate INSERT or update statement; this seed is intentionally weak
-- because the credentials are committed.
INSERT INTO users (id, username, password_hash, role, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    'admin',
    crypt('admin', gen_salt('bf', 10)),  -- cost 10 = Spring Security default
    'ADMIN',
    NOW(),
    NOW()
);
