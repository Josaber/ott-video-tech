#!/usr/bin/env bash
# End-to-end smoke test:
#   1. start postgres via docker compose
#   2. build + start ad-service on :8090, backend on :8080
#   3. create asset, upload a tiny FFmpeg-generated mp4, trigger processing
#   4. poll until PUBLISHED, fetch /playback/{id}/master.m3u8
#   5. assert manifest invariants (DATERANGE → KEY=NONE → ad ts → DISCONTINUITY → AES-128 → program ts)
#   6. stop services + postgres on exit
#
# Run from repo root:
#     bash scripts/smoke.sh
#
# Localhost curl uses --noproxy '*' to bypass any HTTP_PROXY env that
# would otherwise route 127.0.0.1 through a system proxy and 502.

set -u
set -o pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

AD_SERVICE_LOG="$REPO_ROOT/scripts/.smoke-ad-service.log"
BACKEND_LOG="$REPO_ROOT/scripts/.smoke-backend.log"
SAMPLE_VIDEO="$REPO_ROOT/scripts/.smoke-sample.mp4"
AD_PID=""
BACKEND_PID=""
STARTED_POSTGRES=0

red()    { printf '\033[31m%s\033[0m\n' "$*"; }
green()  { printf '\033[32m%s\033[0m\n' "$*"; }
yellow() { printf '\033[33m%s\033[0m\n' "$*"; }
step()   { printf '\n\033[1;36m>>> %s\033[0m\n' "$*"; }

cleanup() {
  local code=$?
  step "cleanup"
  if [[ -n "$BACKEND_PID" ]] && kill -0 "$BACKEND_PID" 2>/dev/null; then
    kill "$BACKEND_PID" 2>/dev/null || true
    wait "$BACKEND_PID" 2>/dev/null || true
  fi
  if [[ -n "$AD_PID" ]] && kill -0 "$AD_PID" 2>/dev/null; then
    kill "$AD_PID" 2>/dev/null || true
    wait "$AD_PID" 2>/dev/null || true
  fi
  if [[ "$STARTED_POSTGRES" == "1" ]]; then
    docker compose stop postgres >/dev/null 2>&1 || true
  fi
  if (( code != 0 )); then
    red "FAILED (exit $code)"
    yellow "logs:"
    yellow "  ad-service: $AD_SERVICE_LOG"
    yellow "  backend:    $BACKEND_LOG"
  fi
  exit "$code"
}
trap cleanup EXIT INT TERM

curl_local() {
  curl --noproxy '*' -sS "$@"
}

AUTH_HEADER=""
curl_api() {
  if [[ -n "$AUTH_HEADER" ]]; then
    curl_local -H "$AUTH_HEADER" "$@"
  else
    curl_local "$@"
  fi
}

require() {
  command -v "$1" >/dev/null 2>&1 || { red "missing: $1"; exit 1; }
}

# ---------- preflight ----------
step "preflight"
require curl
require docker
require mvn
require ffmpeg
require jq

# ---------- postgres ----------
step "starting postgres"
if docker compose ps --status running postgres 2>/dev/null | grep -q postgres; then
  yellow "postgres already running, reusing"
else
  docker compose up -d postgres >/dev/null
  STARTED_POSTGRES=1
fi

step "waiting for postgres"
for i in {1..30}; do
  if docker compose exec -T postgres pg_isready -U ott_demo -d ott_video_demo >/dev/null 2>&1; then
    green "postgres ready"; break
  fi
  sleep 1
  if (( i == 30 )); then red "postgres did not become ready"; exit 1; fi
done

# ---------- build ----------
step "building ad-service + backend (skip tests)"
mvn -q -f ad-service/pom.xml -DskipTests package
mvn -q -f backend/pom.xml -DskipTests package

# ---------- ad-service ----------
step "starting ad-service on :8090"
( mvn -q -f ad-service/pom.xml spring-boot:run > "$AD_SERVICE_LOG" 2>&1 ) &
AD_PID=$!

for i in {1..60}; do
  if curl_local -o /dev/null -w '%{http_code}' http://127.0.0.1:8090/actuator/health 2>/dev/null | grep -q 200; then
    green "ad-service ready"; break
  fi
  sleep 1
  if (( i == 60 )); then red "ad-service did not become ready"; exit 1; fi
done

# ---------- backend ----------
step "starting backend on :8080"
( mvn -q -f backend/pom.xml spring-boot:run > "$BACKEND_LOG" 2>&1 ) &
BACKEND_PID=$!

for i in {1..90}; do
  if curl_local -o /dev/null -w '%{http_code}' http://127.0.0.1:8080/actuator/health 2>/dev/null | grep -q 200; then
    green "backend ready"; break
  fi
  sleep 1
  if (( i == 90 )); then red "backend did not become ready"; exit 1; fi
done

# ---------- login ----------
step "logging in as admin"
LOGIN_JSON=$(curl_local -X POST http://127.0.0.1:8080/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"admin","password":"admin"}')
TOKEN=$(echo "$LOGIN_JSON" | jq -r '.accessToken')
REFRESH=$(echo "$LOGIN_JSON" | jq -r '.refreshToken')
if [[ -z "$TOKEN" || "$TOKEN" == "null" ]]; then
  red "login failed: $LOGIN_JSON"; exit 1
fi
if [[ -z "$REFRESH" || "$REFRESH" == "null" ]]; then
  red "login response missing refreshToken"; exit 1
fi
AUTH_HEADER="Authorization: Bearer $TOKEN"
green "got access (${#TOKEN} chars) and refresh (${#REFRESH} chars)"

step "verifying token via /auth/me"
ME=$(curl_api http://127.0.0.1:8080/auth/me)
echo "  $ME"
if ! echo "$ME" | jq -e '.username == "admin" and .role == "ADMIN"' >/dev/null; then
  red "/auth/me did not return admin ADMIN"; exit 1
fi

step "verifying /auth/refresh issues a fresh access token"
NEW_LOGIN=$(curl_local -X POST http://127.0.0.1:8080/auth/refresh \
  -H 'Content-Type: application/json' \
  -d "$(jq -n --arg t "$REFRESH" '{refreshToken:$t}')")
NEW_TOKEN=$(echo "$NEW_LOGIN" | jq -r '.accessToken')
if [[ -z "$NEW_TOKEN" || "$NEW_TOKEN" == "null" || "$NEW_TOKEN" == "$TOKEN" ]]; then
  red "refresh failed or returned the same token: $NEW_LOGIN"; exit 1
fi
green "  ok: fresh access token (${#NEW_TOKEN} chars)"

step "verifying /api/videos rejects no-auth"
CODE=$(curl_local -o /dev/null -w '%{http_code}' http://127.0.0.1:8080/api/videos)
if [[ "$CODE" == "401" ]]; then
  green "  ok: /api/videos without token -> 401"
else
  red "  /api/videos without token -> $CODE (expected 401)"; exit 1
fi

# ---------- sample video ----------
step "generating sample raw video"
ffmpeg -y -loglevel error \
  -f lavfi -i "color=c=0x1f3a93:s=640x360:d=4:r=30,drawtext=text='SMOKE\\: hello':fontcolor=white:fontsize=40:x=(w-text_w)/2:y=(h-text_h)/2" \
  -f lavfi -i "sine=frequency=220:sample_rate=48000:duration=4" \
  -c:v libx264 -preset ultrafast -pix_fmt yuv420p \
  -c:a aac -b:a 96k -shortest -movflags +faststart \
  "$SAMPLE_VIDEO"

# ---------- demo flow ----------
step "creating asset"
ASSET_JSON=$(curl_api -X POST http://127.0.0.1:8080/api/videos \
  -H 'Content-Type: application/json' \
  -d '{"title":"smoke","description":"e2e smoke test"}')
ASSET_ID=$(echo "$ASSET_JSON" | jq -r '.id')
echo "asset id: $ASSET_ID"

step "uploading raw"
curl_api -X POST "http://127.0.0.1:8080/api/videos/$ASSET_ID/upload" \
  -F "file=@$SAMPLE_VIDEO" >/dev/null

step "triggering processing"
curl_api -X POST "http://127.0.0.1:8080/api/videos/$ASSET_ID/process" >/dev/null

step "polling job timeline"
PUBLISHED=0
for i in {1..120}; do
  STATUS=$(curl_api "http://127.0.0.1:8080/api/videos/$ASSET_ID" | jq -r '.status')
  echo "  [$i] status=$STATUS"
  if [[ "$STATUS" == "PUBLISHED" ]]; then PUBLISHED=1; break; fi
  if [[ "$STATUS" == "FAILED" ]]; then
    red "asset went FAILED"
    curl_api "http://127.0.0.1:8080/api/videos/$ASSET_ID/jobs" | jq .
    exit 1
  fi
  sleep 2
done
if (( PUBLISHED == 0 )); then red "asset did not reach PUBLISHED in time"; exit 1; fi

# ---------- manifest invariants ----------
step "verifying /playback/.../master.m3u8 requires auth"
NOAUTH_M=$(curl_local -o /dev/null -w '%{http_code}' "http://127.0.0.1:8080/playback/$ASSET_ID/master.m3u8")
if [[ "$NOAUTH_M" == "401" ]]; then
  green "  ok: master.m3u8 without token -> 401"
else
  red "  master.m3u8 without token returned $NOAUTH_M (expected 401)"; exit 1
fi

step "fetching stitched playback manifest with token"
MANIFEST=$(curl_api "http://127.0.0.1:8080/playback/$ASSET_ID/master.m3u8")
echo "----- manifest -----"
echo "$MANIFEST"
echo "--------------------"

step "checking invariants"
assert_contains() {
  local needle="$1" label="$2"
  if grep -qF "$needle" <<< "$MANIFEST"; then
    green "  ok: $label"
  else
    red "  miss: $label ($needle)"; exit 1
  fi
}
assert_order() {
  local first="$1" second="$2" label="$3"
  local i1 i2
  i1=$(awk -v n="$first" 'index($0,n){print NR;exit}' <<< "$MANIFEST")
  i2=$(awk -v n="$second" 'index($0,n){print NR;exit}' <<< "$MANIFEST")
  if [[ -n "$i1" && -n "$i2" && "$i1" -lt "$i2" ]]; then
    green "  ok: $label ($first @$i1 before $second @$i2)"
  else
    red "  miss: $label"; exit 1
  fi
}

assert_contains "#EXT-X-DATERANGE:ID=\"demo-preroll\"" "DATERANGE present"
assert_contains "#EXT-X-DISCONTINUITY" "DISCONTINUITY present"
assert_contains "#EXT-X-KEY:METHOD=NONE" "explicit clear ad key"
assert_contains "#EXT-X-KEY:METHOD=AES-128" "program AES-128 key"

assert_order "#EXT-X-DATERANGE" "#EXT-X-DISCONTINUITY"     "DATERANGE before DISCONTINUITY"
assert_order "#EXT-X-KEY:METHOD=NONE" "#EXT-X-KEY:METHOD=AES-128" "ad key before program key"
assert_order "ads/" "#EXT-X-DISCONTINUITY"                 "ad segment URL before DISCONTINUITY"
assert_order "#EXT-X-DISCONTINUITY" "segment_000.ts"       "DISCONTINUITY before first program ts"

step "checking ad ts segment reachable through ad-service"
AD_SEG_URL=$(grep -m1 -E '^http://127.0.0.1:8090/ads/.*\.ts$' <<< "$MANIFEST" || true)
if [[ -z "$AD_SEG_URL" ]]; then red "could not find absolute ad ts URL"; exit 1; fi
HTTP_CODE=$(curl_local -o /dev/null -w '%{http_code}' "$AD_SEG_URL")
if [[ "$HTTP_CODE" == "200" ]]; then
  green "  ok: $AD_SEG_URL → 200"
else
  red "  ad segment $AD_SEG_URL returned $HTTP_CODE"; exit 1
fi

step "checking program ts segment reachable through backend"
PROG_HTTP_CODE=$(curl_local -o /dev/null -w '%{http_code}' "http://127.0.0.1:8080/playback/$ASSET_ID/segment_000.ts")
if [[ "$PROG_HTTP_CODE" == "200" ]]; then
  green "  ok: program segment_000.ts → 200"
else
  red "  program segment returned $PROG_HTTP_CODE"; exit 1
fi

step "checking license.key rejects unsigned URL"
UNSIGNED=$(curl_local -o /dev/null -w '%{http_code}' "http://127.0.0.1:8080/playback/$ASSET_ID/license.key")
if [[ "$UNSIGNED" == "403" ]]; then
  green "  ok: license.key without signature -> 403"
else
  red "  license.key without signature returned $UNSIGNED (expected 403)"; exit 1
fi

step "checking license.key accepts the signed URL embedded in the manifest"
SIGNED_QUERY=$(echo "$MANIFEST" | grep -oE 'license\.key\?[^"]+' | head -1)
if [[ -z "$SIGNED_QUERY" ]]; then
  red "could not extract signed license URL from manifest"; exit 1
fi
KEY_HTTP_CODE=$(curl_local -o /dev/null -w '%{http_code}' "http://127.0.0.1:8080/playback/$ASSET_ID/$SIGNED_QUERY")
if [[ "$KEY_HTTP_CODE" == "200" ]]; then
  green "  ok: signed license.key -> 200"
else
  red "  signed license.key returned $KEY_HTTP_CODE"; exit 1
fi

green ""
green "================================="
green "  SMOKE TEST PASSED"
green "================================="
