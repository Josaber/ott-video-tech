-- Temporal auto-setup expects two databases to exist before it can install
-- its schema. The container will then run schema-setup-1.24.2 against them.
CREATE DATABASE temporal;
CREATE DATABASE temporal_visibility;
