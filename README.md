# OTT Video Tech Demo

End-to-end VOD publishing demo: metadata → raw upload → FFmpeg transcode → HLS package → SSAI pre-roll stitch (against a standalone ad service) → AES-128 DRM on the program only → m3u8 playback with player-side ad-skip lock.

## Modules

| Module        | Stack                                | Port  | Role |
| ------------- | ------------------------------------ | ----- | ---- |
| `ad-service/` | Java 25, Spring Boot 4.1             | 8090  | Fixed-catalog ad source. Generates pre-roll MP4 + HLS on demand with FFmpeg, exposes VAST 4.2 XML and HLS sub-manifests. |
| `backend/`    | Java 25, Spring Boot 4.1, Temporal, FFmpeg, Postgres, Flyway | 8080 | VOD pipeline. Workers per stage, embedded Temporal, manifest stitcher. |
| `frontend/`   | React + Vite + hls.js                | 5173  | Workflow console + player with ad seek-lock. |
| `docker-compose.yml` | Postgres 16 Alpine            | 55432 | Local database. |

## Prerequisites

- Java 25 + Maven 3.9+
- Node 20+
- FFmpeg on `$PATH` (`brew install ffmpeg`)
- Docker (for Postgres)

## Local quickstart

```bash
make db-up          # postgres on :55432
make ad-service     # in shell 1: ad-service on :8090
make backend        # in shell 2: backend on :8080 (runs Flyway, embedded Temporal)
make install        # one-time: npm install frontend deps
make frontend       # in shell 3: vite on :5173
```

Open `http://127.0.0.1:5173`, sign in with **`admin` / `admin`**, create an asset, upload a raw video, click **Process & publish**, watch the workflow run, then play the resulting m3u8.

## Authentication

Self-signed HS256 JWT verified by Spring Security's oauth2-resource-server. The default user `admin / admin` is seeded by Flyway V2 using PostgreSQL's `pgcrypto` (`crypt('admin', gen_salt('bf', 10))`); the resulting `$2a$10$…` hash is byte-compatible with `BCryptPasswordEncoder.matches()` so no separate seed script is needed.

| Endpoint                              | Auth |
| ------------------------------------- | ---- |
| `POST /auth/login`                    | open (returns Bearer token) |
| `POST /auth/register`                 | open (creates VIEWER, returns Bearer token) |
| `POST /auth/change-password`          | Bearer (subject taken from JWT) |
| `GET  /auth/me`                       | Bearer |
| `GET  /actuator/health`               | open |
| `POST /api/videos`, `/upload`, `/process` | Bearer + `ROLE_ADMIN` |
| `GET  /api/videos*`                   | Bearer |
| `GET  /playback/{id}/master.m3u8`     | Bearer (used to mint a viewer-bound signed license URL inside the manifest) |
| `GET  /playback/{id}/segment_*.ts`    | open (TODO: signed segment URLs) |
| `GET  /playback/{id}/license.key`     | open + signed URL (sig is the credential, exp 10 min, viewer-bound) |
| `POST /auth/refresh`                  | open (carries its own refresh-typ JWT) |
| ad-service `/vast`, `/ads/...`        | open (browser fetches ad ts directly) |

The frontend decodes the JWT `exp` claim locally and re-checks it every 30 s, so a quietly-expired session flips back to the login screen without waiting for an API call to 401.

Override the secret with `JWT_SECRET=…` (must be ≥ 32 bytes) and token lifetime with `JWT_TTL_HOURS=…`. The HLS player attaches `Authorization` only to same-origin requests via hls.js `xhrSetup`, so cross-origin ad-service ts fetches don't trigger a CORS preflight per segment.

## Demo flow

1. `POST /api/videos` — create metadata, status `UNPUBLISHED`.
2. `POST /api/videos/{id}/upload` — multipart raw video, recorded as an `UPLOAD` job.
3. `POST /api/videos/{id}/process` — kicks off the Temporal `VideoPublishingWorkflow`:
   - `TRANSCODE` — FFmpeg to H.264/AAC MP4.
   - `PACKAGE` — FFmpeg HLS packaging (`master.m3u8` + `.ts`).
   - `SSAI` — calls ad-service `/vast?adId=…`, parses VAST 4.2 XML, captures ad HLS URL + duration on the asset.
   - `DRM` — re-packages program HLS with AES-128 + key file.
   - `PUBLISH` — flips status to `PUBLISHED`.
4. `GET /playback/{id}/master.m3u8` — backend stitches the ad m3u8 from ad-service into the DRM-encrypted program manifest at request time:
   - `#EXT-X-DATERANGE:ID="demo-preroll",DURATION=…,X-AD-ID="…"`
   - `#EXT-X-KEY:METHOD=NONE`
   - ad ts segments (absolute URLs back to ad-service, CORS-enabled)
   - `#EXT-X-DISCONTINUITY`
   - `#EXT-X-KEY:METHOD=AES-128,URI=/playback/{id}/license.key,IV=…`
   - program ts segments (served by backend)

## Why a separate ad service?

Real SSAI integrations call out to an ad decisioning system (VAST/VMAP). Splitting it out:

- proves the backend's SSAI worker integrates over a network protocol, not just a local file
- shows the manifest stitching across two domains with absolute URLs + CORS
- lets you swap the ad source without touching the VOD pipeline

The ad-service ships a small fixed catalog (`preroll-brand-a`, `-b`, `-c`). On first request it runs FFmpeg with `lavfi` to draw a color card + caption + sine-wave audio, then HLS-packages it. Results are cached on disk under `ad-service/data/ads/{adId}/`.

Switch ad with `app.ssai.ad-id=preroll-brand-b` on the backend.

## Manifest stitching invariants

Verified by `AdManifestStitcherTest`:

- `#EXT-X-DATERANGE:ID="demo-preroll"` is the first ad marker.
- Ad section sits before any `#EXT-X-KEY` line for AES.
- `#EXT-X-DISCONTINUITY` separates ad from program.
- Program `#EXT-X-KEY:METHOD=AES-128` is preserved unchanged.
- Ad ts URLs are rewritten to absolute against the ad manifest URL.

## Player ad-lock

`HlsPlayer.tsx` reads `DURATION` from `#EXT-X-DATERANGE` and enforces:

- `seeking` past `maxWatched` while `currentTime < adEnd` snaps back.
- `playbackRate > 1` is forced to `1` during the ad window.
- Keyboard fast-forward keys (`ArrowRight`, `>`, `l`, `.`) are preventDefault-ed during the ad.

This is player-side enforcement — true bypass-prevention needs sessionized server-side manifests and segment gating.

## Endpoints

### Ad service

| Method | Path                          | Notes |
| ------ | ----------------------------- | ----- |
| GET    | `/catalog`                    | Fixed ads available |
| GET    | `/vast?adId=…`                | VAST 4.2 XML, MediaFile points to the HLS m3u8 |
| GET    | `/ads/{adId}/master.m3u8`     | HLS manifest (lazy-generated) |
| GET    | `/ads/{adId}/segment_NNN.ts`  | TS segments |

### Backend

| Method | Path                                | Notes |
| ------ | ----------------------------------- | ----- |
| POST   | `/api/videos`                       | create metadata |
| GET    | `/api/videos`                       | list |
| GET    | `/api/videos/{id}`                  | get one |
| GET    | `/api/videos/{id}/jobs`             | job timeline |
| POST   | `/api/videos/{id}/upload`           | multipart raw upload (≤512MB) |
| POST   | `/api/videos/{id}/process`          | start Temporal workflow |
| GET    | `/playback/{id}/master.m3u8`        | stitched manifest |
| GET    | `/playback/{id}/license.key`        | AES-128 key |
| GET    | `/playback/{id}/segment_NNN.ts`     | program ts |
| GET    | `/actuator/health`                  | `UP` when DB + Temporal are ready |

## Configuration knobs

Backend (`backend/src/main/resources/application.yml` or env):

- `app.media.ffmpeg-path` — FFmpeg binary (default `ffmpeg`).
- `app.media.hls-segment-seconds` — program HLS segment size (default 4).
- `app.ssai.ad-service-base-url` — where the ad-service lives (default `http://127.0.0.1:8090`).
- `app.ssai.ad-id` — which fixed ad to inject.
- `app.temporal.mode` — `embedded` (default) or `remote` (`app.temporal.remote.target=host:7233`).

Ad service (`ad-service/src/main/resources/application.yml`):

- `app.ad.catalog[*]` — fixed list of ads with color/duration/audio/tagline.
- `app.ad.public-base-url` — used in VAST `MediaFile` URLs.

## Tests

```bash
make test
```

Covers VAST building, VAST parsing, manifest stitching order/DATERANGE/KEY placement, and a real FFmpeg run that generates an ad and asserts the manifest + segments exist (skipped automatically when `ffmpeg` is not on `PATH`).

## End-to-end smoke

```bash
make smoke         # needs: docker, mvn, ffmpeg, jq, curl
```

`scripts/smoke.sh`:
1. starts Postgres, builds + boots ad-service and backend
2. generates a 4-second sample mp4 with FFmpeg
3. creates an asset, uploads, triggers `process`, polls until `PUBLISHED`
4. fetches `/playback/{id}/master.m3u8` and asserts:
   - `#EXT-X-DATERANGE:ID="demo-preroll"` present
   - `#EXT-X-KEY:METHOD=NONE` precedes `#EXT-X-KEY:METHOD=AES-128`
   - ad ts URLs precede `#EXT-X-DISCONTINUITY` which precedes program ts URLs
5. curls one ad ts (ad-service), one program ts, and the license key — all expected `200`
6. stops backend, ad-service, and Postgres on exit (success or failure)

Localhost curls in the script bypass `HTTP_PROXY` with `--noproxy '*'` so a system proxy (Clash/VPN/corp) does not 502 the loop.

## Build

```bash
make build
```

## Commit convention

This repo uses [Conventional Commits](https://www.conventionalcommits.org/) enforced by `commitlint` + `husky`:

```bash
npm install            # one-time at repo root → installs commitlint hook
git commit -m "feat(backend): add mid-roll ad slot"
```

Hook lives in `.husky/commit-msg`; rules in `commitlint.config.mjs`.

## Known limitations / next steps

Treat this project as a **reference for the publishing pipeline shape**, not as a production OTT stack. The following corners are deliberately demo-sized or missing entirely.

### Architecture-level caveats (read before demoing)

- **"DRM" is HLS AES-128 + signed key URLs, not real DRM.** The content key is generated per asset, the `license.key` URL is HMAC-signed for one viewer with a 10-minute TTL (see `LicenseUrlSigner`), and the manifest endpoint rewrites the `#EXT-X-KEY` URI on the fly. This is a meaningful step up from naked AES-128 — a leaked URL stops working and can't be reused on another asset — but it is **not** Widevine/FairPlay/PlayReady: there is no license server, no device binding, no output protection (HDCP), and the symmetric key still leaves the box in cleartext. A real DRM story needs Shaka Packager (or equivalent) + a license proxy + an EME-capable player.
- **`embedded` Temporal mode is not durable.** `make backend` boots `TestWorkflowEnvironment` (in-memory) by default so the demo runs with zero extra containers. For a durable setup run `make temporal-up` (starts `temporalio/auto-setup` + `temporal-ui` against the same Postgres, on `:7233` / `:8088`) and then `make backend-remote` — workflow state survives restarts and `StuckAssetSweeper` then mostly has nothing to do. **If you already had a Postgres volume from before `make temporal-up` existed, run `make db-fresh` first** so `infra/postgres/init/01-temporal-db.sql` (which only runs on first boot) gets a chance to create the `temporal` / `temporal_visibility` databases.
- **Auth is single-role and demo-shaped.** `/api/**` + `/playback/*/license.key` are gated by a self-signed HS256 JWT, but the manifest and ts segments stay open, the ad-service has no auth, the JWT secret defaults to a committed dev value (override with `JWT_SECRET`), there is no refresh token, and the seed user is `admin / admin`. Production needs proper user management, role-based authorization, key rotation, and per-viewer signed manifests.
- **SSAI has no ad decisioning.** A single fixed `app.ssai.ad-id` from config is used for every asset. No targeting, no auction, no frequency capping, no VMAP, no per-viewer ad rotation.
- **No sessionized manifest.** Same asset id → same manifest forever. The ad-skip lock is enforced only on the player; `curl /playback/{id}/segment_NNN.ts` bypasses everything.
- **Single bitrate.** No ABR ladder. The `master.m3u8` is a media playlist, not a variant playlist of multiple bitrates.

### Known deferred work

- Player-side ad lock only; a real product needs server-side segment gating tied to per-session manifests.
- Single pre-roll slot; no mid-roll / post-roll yet.
- VAST parsing is intentionally minimal (no `<Wrapper>` chains, no tracking events / quartiles / clicks).
- Storage is local disk; no S3/GCS/Azure or CDN origin offload.
- No metrics, no distributed tracing — only Actuator `/health`.
- Frontend error UX is a single `<div>` with `String(error)`; no toast, no retry surface.
