// Pure helpers / constants shared across the HlsPlayer hooks and JSX
// sub-components. No React here — anything that touches the DOM lives
// in a hook, not this file.

export interface ThumbCue {
  start: number
  end: number
  x: number
  y: number
  w: number
  h: number
  sprite: string
}

export const PLAYBACK_RATES = [0.5, 0.75, 1, 1.25, 1.5, 2]

// Resume threshold: ignore stale progress in the first few seconds
// (avoids jumping ~3 s when the user just started). Also treat
// "within last N seconds" as finished — saves a "resume from 99%" UX
// failure.
export const RESUME_MIN_SEC = 5
export const FINISHED_TAIL_SEC = 5

// Stitched → program time offset. Matches SsaiProperties.prerollPodDurationSeconds
// on the backend. Used by share-at-timestamp and the initial-seek effect to
// convert between the program timeline (what the user thinks they shared)
// and the stitched timeline (what the player actually plays).
export const PREROLL_OFFSET_SEC = 16

// Matches a WebVTT cue with a `sprite.png#xywh=x,y,w,h` body — the format
// FFmpeg's thumbnail script emits. Tolerates the optional decimal seconds.
export const CUE_PATTERN =
  /(\d+):(\d+):(\d+(?:\.\d+)?)\s+-->\s+(\d+):(\d+):(\d+(?:\.\d+)?)[\s\S]*?\n([^\s]+)#xywh=(\d+),(\d+),(\d+),(\d+)/

export function hmsToSec(h: string, m: string, s: string): number {
  return parseInt(h, 10) * 3600 + parseInt(m, 10) * 60 + parseFloat(s)
}

export function fmt(sec: number): string {
  if (!Number.isFinite(sec) || sec < 0) return '0:00'
  const total = Math.floor(sec)
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  const mm = m.toString().padStart(h > 0 ? 2 : 1, '0')
  const ss = s.toString().padStart(2, '0')
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`
}

// Constrain the trick-play preview popover so it stays inside the
// scrub strip's bounding box even when the cursor is near either edge.
export function clampPreview(x: number, stripW: number, thumbW: number): number {
  const half = thumbW / 2
  return Math.max(half, Math.min(stripW - half, x)) - half
}
