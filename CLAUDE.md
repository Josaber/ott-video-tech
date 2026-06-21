# OTT Video Tech Demo

End-to-end OTT VOD publishing slice: React SPA + Spring Boot 4.1 backend (Java 25) + a separate Spring Boot ad-service + PostgreSQL 18 + embedded Temporal workflow. All OTT concepts (HLS, codecs, containers, SSAI, DRM, Multi-DRM, CDN, identity, payments, compliance, etc.) are written up in the in-app **Docs** view (45 chapters across 6 Parts, ~4 h cover-to-cover). When asked about an OTT concept, point users at the relevant Docs chapter rather than re-explaining inline.

## Stack

- **Backend** — Spring Boot 4.1 + Spring Security 7. HS256 JWT with dual decoder for `typ` claim, `token_version` revocation cached behind Caffeine, change-password keeps caller signed in.
- **Workflow** — Temporal SDK 1.31, runs **embedded** by default (no separate cluster). `app.temporal.mode=remote` switches to the docker-compose Temporal cluster.
- **Storage** — PostgreSQL 18 with Flyway migrations.
- **Frontend** — React + Vite + hls.js.
- **Ad-service** — separate Spring Boot 4.1 process. Generates ad ts segments on demand with FFmpeg and serves VAST 4.2 XML.

## Toolchain (macOS Intel 13.5.2 — Tier 2 brew config)

`brew install openjdk@25` requires the full Xcode.app on Intel macOS 13.x; `brew install maven` triggers source builds of gnulib's test suite. Use tarball installs instead — see the `macos-intel-tier2-brew-jdk-maven-tarball` skill.

- **JDK 25** — Adoptium Temurin 25 at `~/Library/Java/JavaVirtualMachines/jdk-25.0.3+9/Contents/Home`
- **Maven** — 3.9.16 at `~/.local/apache-maven-3.9.16/bin/`
- **ffmpeg** — static binary from evermeet.cx at `~/.local/bin/ffmpeg` (ad-service shells out to it too)

## Running locally

```bash
export JAVA_HOME=~/Library/Java/JavaVirtualMachines/jdk-25.0.3+9/Contents/Home
export PATH=~/.local/apache-maven-3.9.16/bin:~/.local/bin:$JAVA_HOME/bin:$PATH
export FFMPEG_PATH=~/.local/bin/ffmpeg
export PUBLIC_BASE_URL=""    # so backend emits relative playback URLs the Vite proxy can handle

make db-up        # postgres :5432 (host port matches container, no remap)
make ad-service   # :8090 (separate shell, needs ffmpeg on PATH)
make backend      # :8080 (separate shell)
make frontend     # vite :5173 (separate shell)
make smoke        # end-to-end smoke that boots stack, runs a full publish + asserts
```

Default seeded admin: **`admin` / `admin`** (via pgcrypto in `V2__auth.sql`).

## Commit conventions

- **commitlint v9 + husky** enforces Conventional Commits on every commit. Don't bypass with `--no-verify`.
- Subject **must** be lowercase. Acronym-leading subjects (`HLS: ...`, `DRM-lite: ...`) are rejected as start-case / upper-case — rewrite as `hls: ...` or rephrase.
- Each commit ends with:
  ```
  Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
  ```
- Body wraps at ~72 chars.

## Spring Boot 4 / Spring Security 7 gotchas (already fixed — don't re-discover)

- **Flyway autoconfig** was moved out of `spring-boot-autoconfigure` in SB4 into a new `spring-boot-flyway` module. Raw `flyway-core` on the classpath no longer triggers migrations; pom needs `spring-boot-starter-flyway`. Symptom: Hibernate `validate` failing with "missing table". See `spring-boot-4-flyway-autoconfig-starter-required` skill.
- **`ClientHttpRequestFactoryBuilder` / `ClientHttpRequestFactorySettings`** were removed in SB4. Use `org.springframework.http.client.SimpleClientHttpRequestFactory` from spring-web 7 with `setConnectTimeout(Duration)` / `setReadTimeout(Duration)` directly. See `spring-boot-4-removed-client-http-request-factory-builder` skill.
- **Spring Security 7** no longer falls back to bean name `jwtDecoder` when two `JwtDecoder` beans coexist. The access decoder needs `@Primary` (or `.jwt(j -> j.decoder(accessDecoder))` on the DSL). See `spring-security-7-jwt-decoder-bean-name-fallback-gone` skill.
- **Multipart limits** must live under `spring.servlet.multipart.*` — `server.servlet.multipart.*` is silently ignored and Tomcat falls back to its 1 MB default. See `spring-boot-multipart-config-server-vs-spring-prefix` skill.

## Other gotchas

- **Postgres 18 data dir layout changed.** The volume must mount at `/var/lib/postgresql`, not `/var/lib/postgresql/data` — the image bails on the old layout. `docker-compose.yml` already reflects this.
- **Temporal 1.29.7 healthcheck** must use `tctl cluster health`, not `temporal operator cluster health` (Spice CLI hits a deadline bug). See `temporal-cluster-healthcheck-tctl-not-cli` skill.
- **BCrypt dummy hash** for constant-time login must come from `encoder.encode()`. A literal `$2a$10$invalid…` short-circuits inside the regex check and leaks ~150× user-existence timing. See `spring-bcrypt-dummy-hash-timing-leak` skill.
- **Ad-service `/vast` cold start.** First call per ad does a synchronous FFmpeg encode (~48 s). Backend `RestClient` times out at 10 s, so the first publish always falls back to "no ad". Subsequent publishes hit the cache. Production fix: warm at boot. Listed in Production gaps.
- **`PUBLIC_BASE_URL=""`** in dev so manifests emit relative `/playback/...` URLs — keeps everything same-origin through the Vite proxy, which the player's `xhrSetup` Bearer guard needs (see `hlsjs-xhrsetup-relative-url-same-origin-guard-trap` skill).
- **Vite proxy** in `frontend/vite.config.ts` must include `/auth`, `/api`, `/playback`. Adding a new backend prefix requires a matching proxy entry.

## Repo layout

```
backend/       Spring Boot main — workflow orchestration, auth, DRM-lite
ad-service/    separate Spring Boot — VAST + ad ts generation
frontend/      React + Vite + hls.js
docker-compose.yml  postgres + (optional) temporal cluster
scripts/smoke.sh    end-to-end smoke
infra/postgres/init/ first-boot SQL (creates temporal databases)
```

## In-app docs are the source of truth

The Docs view (top-right nav, `#/docs`) is the canonical OTT reference for this project. Reading paths at `#/docs/guide`. Each chapter has a "SEE ALSO" footer cross-referencing related chapters; chapter headers show `~K min read` estimates. Don't duplicate Docs content here — link to a chapter slug instead.
