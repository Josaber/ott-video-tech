import { useEffect, useMemo, useRef, useState } from 'react'
import Hls from 'hls.js'
import { getToken } from '../api/auth'
import { api } from '../api/client'

interface Props {
  src: string
  assetId?: string
  thumbnailsUrl?: string | null
}

// Resume threshold: ignore stale progress in the first few seconds (avoids
// jumping ~3 s when the user just started). Also treat "within last N seconds"
// as finished — saves a "resume from 99%" UX failure.
const RESUME_MIN_SEC = 5
const FINISHED_TAIL_SEC = 5

interface ThumbCue {
  start: number
  end: number
  x: number
  y: number
  w: number
  h: number
  sprite: string
}

const CUE_PATTERN =
  /(\d+):(\d+):(\d+(?:\.\d+)?)\s+-->\s+(\d+):(\d+):(\d+(?:\.\d+)?)[\s\S]*?\n([^\s]+)#xywh=(\d+),(\d+),(\d+),(\d+)/

/**
 * Player with ad-not-skippable enforcement:
 *   - reads ad duration from #EXT-X-DATERANGE on the loaded manifest
 *   - while currentTime < adEndTime:
 *       * pulls seeks back to maxWatched
 *       * blocks playbackRate > 1
 *       * intercepts key events that would seek forward
 *   - records maxWatched so a backward seek that re-enters the ad still ends up at adEndTime once you cross out
 *
 * Trick-play scrub bar:
 *   - rendered below the native controls
 *   - on hover: looks up the thumbnail cue at that timestamp and renders the sprite tile
 *   - on click: seeks the video (subject to the ad guard above)
 */
export function HlsPlayer({ src, assetId, thumbnailsUrl }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const stripRef = useRef<HTMLDivElement>(null)
  const [adEnd, setAdEnd] = useState<number>(0)
  const [adActive, setAdActive] = useState<boolean>(false)
  const maxWatched = useRef<number>(0)
  const [cues, setCues] = useState<ThumbCue[]>([])
  const [spriteUrl, setSpriteUrl] = useState<string>('')
  const [duration, setDuration] = useState<number>(0)
  const [currentTime, setCurrentTime] = useState<number>(0)
  const [hover, setHover] = useState<{ x: number; time: number } | null>(null)
  const [resumedFrom, setResumedFrom] = useState<number | null>(null)
  const resumeApplied = useRef<boolean>(false)
  const lastSavedMs = useRef<number>(-1)
  const hlsRef = useRef<Hls | undefined>(undefined)
  const [audioTracks, setAudioTracks] = useState<{ id: number; name: string; lang?: string }[]>([])
  const [activeAudio, setActiveAudio] = useState<number>(-1)
  const [subtitleTracks, setSubtitleTracks] = useState<{ id: number; name: string; lang?: string }[]>([])
  const [activeSubtitle, setActiveSubtitle] = useState<number>(-1)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    maxWatched.current = 0
    setAdEnd(0)
    setAdActive(false)
    setDuration(0)
    setCurrentTime(0)

    setAudioTracks([])
    setActiveAudio(-1)
    setSubtitleTracks([])
    setActiveSubtitle(-1)

    let hls: Hls | undefined
    if (Hls.isSupported()) {
      hls = new Hls({
        debug: false,
        // Attach the Bearer token only to same-origin (backend) requests so
        // license.key is authenticated. Cross-origin requests (ad-service ts
        // segments) get no header — they don't accept auth anyway and we
        // avoid the CORS preflight cost.
        xhrSetup: (xhr, url) => {
          // Attach the Bearer only to same-origin (backend) requests. We treat
          // a leading "/" as same-origin too because hls.js does NOT normalize
          // relative URLs before invoking xhrSetup, and a relative URL like
          // "/playback/.../master.m3u8" obviously can't start with the
          // window.location.origin string.
          const token = getToken()
          const sameOrigin = url.startsWith('/') || url.startsWith(window.location.origin)
          if (token && sameOrigin) {
            xhr.setRequestHeader('Authorization', `Bearer ${token}`)
          }
        },
      })
      hlsRef.current = hls
      hls.loadSource(src)
      hls.attachMedia(video)
      const refreshTracks = () => {
        const h = hlsRef.current
        if (!h) return
        setAudioTracks(h.audioTracks.map((t, i) => ({
          id: i,
          name: t.name ?? `Audio ${i + 1}`,
          lang: t.lang,
        })))
        setActiveAudio(h.audioTrack)
        setSubtitleTracks(h.subtitleTracks.map((t, i) => ({
          id: i,
          name: t.name ?? `Subtitles ${i + 1}`,
          lang: t.lang,
        })))
        setActiveSubtitle(h.subtitleTrack)
      }
      hls.on(Hls.Events.MANIFEST_PARSED, refreshTracks)
      hls.on(Hls.Events.AUDIO_TRACKS_UPDATED, refreshTracks)
      hls.on(Hls.Events.SUBTITLE_TRACKS_UPDATED, refreshTracks)
      hls.on(Hls.Events.AUDIO_TRACK_SWITCHED, (_e, d) => setActiveAudio(d.id))
      hls.on(Hls.Events.SUBTITLE_TRACK_SWITCH, (_e, d) => setActiveSubtitle(d.id))
      hls.on(Hls.Events.MANIFEST_PARSED, (_e, data) => {
        const d = extractAdDuration(data)
        if (d > 0) {
          setAdEnd(d)
          setAdActive(true)
        }
      })
      hls.on(Hls.Events.LEVEL_LOADED, (_e, data) => {
        const rawManifest = (data as { details: { fragments: unknown[] } }).details
        const fragments = rawManifest.fragments as { tagList?: string[][] }[]
        const dateRange = fragments
          .flatMap((f) => f.tagList ?? [])
          .find((t) => Array.isArray(t) && t[0] === 'EXT-X-DATERANGE')
        if (dateRange) {
          const match = /DURATION=([0-9.]+)/.exec(dateRange[1] ?? '')
          if (match) {
            const d = parseFloat(match[1])
            if (d > 0) {
              setAdEnd(d)
              setAdActive(true)
            }
          }
        }
      })
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src
    }
    return () => {
      hls?.destroy()
    }
  }, [src])

  useEffect(() => {
    const video = videoRef.current
    if (!video || adEnd <= 0) return

    const onTime = () => {
      if (video.currentTime < adEnd) {
        if (video.currentTime > maxWatched.current) {
          maxWatched.current = video.currentTime
        }
        if (video.playbackRate > 1) {
          video.playbackRate = 1
        }
        if (!adActive) setAdActive(true)
      } else if (adActive) {
        setAdActive(false)
      }
    }
    const onSeeking = () => {
      if (video.currentTime < adEnd && video.currentTime > maxWatched.current + 0.5) {
        video.currentTime = maxWatched.current
      }
    }
    const onRateChange = () => {
      if (video.currentTime < adEnd && video.playbackRate > 1) {
        video.playbackRate = 1
      }
    }
    const onKey = (e: KeyboardEvent) => {
      if (video.currentTime < adEnd) {
        if (['ArrowRight', 'ArrowUp', 'l', 'L', '.', '>'].includes(e.key)) {
          e.preventDefault()
          e.stopPropagation()
        }
      }
    }
    video.addEventListener('timeupdate', onTime)
    video.addEventListener('seeking', onSeeking)
    video.addEventListener('ratechange', onRateChange)
    video.addEventListener('keydown', onKey)
    return () => {
      video.removeEventListener('timeupdate', onTime)
      video.removeEventListener('seeking', onSeeking)
      video.removeEventListener('ratechange', onRateChange)
      video.removeEventListener('keydown', onKey)
    }
  }, [adEnd, adActive])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    const onMeta = () => setDuration(video.duration || 0)
    const onTime = () => setCurrentTime(video.currentTime)
    video.addEventListener('loadedmetadata', onMeta)
    video.addEventListener('durationchange', onMeta)
    video.addEventListener('timeupdate', onTime)
    return () => {
      video.removeEventListener('loadedmetadata', onMeta)
      video.removeEventListener('durationchange', onMeta)
      video.removeEventListener('timeupdate', onTime)
    }
  }, [])

  // Resume from saved position. Wait for loadedmetadata so currentTime
  // assignment actually sticks (Safari ignores seeks on a freshly attached
  // source). Skip resume if no assetId — caller hasn't opted in.
  useEffect(() => {
    if (!assetId) return
    const video = videoRef.current
    if (!video) return
    resumeApplied.current = false
    setResumedFrom(null)
    lastSavedMs.current = -1
    let cancelled = false
    let savedMs: number | null = null
    api.getProgress(assetId).then((p) => {
      if (cancelled || !p) return
      savedMs = p.positionMs
      tryResume()
    }).catch(() => {})

    const tryResume = () => {
      if (resumeApplied.current || savedMs == null || cancelled) return
      const v = videoRef.current
      if (!v) return
      // Need loadedmetadata before seeking; otherwise currentTime is dropped.
      if (!v.duration || !Number.isFinite(v.duration)) return
      const totalSec = v.duration
      const savedSec = savedMs / 1000
      if (savedSec < RESUME_MIN_SEC) {
        resumeApplied.current = true
        return
      }
      if (totalSec > 0 && savedSec > totalSec - FINISHED_TAIL_SEC) {
        // Treated as finished; play from start.
        resumeApplied.current = true
        return
      }
      v.currentTime = savedSec
      maxWatched.current = savedSec  // tell the ad guard we're past the ad
      setResumedFrom(savedSec)
      resumeApplied.current = true
    }
    const onMeta = () => tryResume()
    video.addEventListener('loadedmetadata', onMeta)
    // If metadata is already loaded by the time the effect runs (e.g., Safari).
    if (video.readyState >= 1) tryResume()
    return () => {
      cancelled = true
      video.removeEventListener('loadedmetadata', onMeta)
    }
  }, [assetId, src])

  // Autosave: every 10 s of playback, PUT the current position. Also save on
  // pause and on unmount. Dedup repeated saves of the same second.
  useEffect(() => {
    if (!assetId) return
    const video = videoRef.current
    if (!video) return
    const save = (force = false) => {
      const t = video.currentTime
      if (!Number.isFinite(t) || t < 0) return
      const ms = Math.round(t * 1000)
      if (!force && Math.abs(ms - lastSavedMs.current) < 1000) return
      lastSavedMs.current = ms
      const dMs = Number.isFinite(video.duration) ? Math.round(video.duration * 1000) : null
      api.putProgress(assetId, { positionMs: ms, durationMs: dMs }).catch(() => {})
    }
    const interval = window.setInterval(() => {
      if (!video.paused && !video.ended) save()
    }, 10000)
    const onPause = () => save(true)
    const onEnded = () => {
      // Treat as finished — save 0 so next visit doesn't resume at the tail.
      lastSavedMs.current = 0
      api.putProgress(assetId, { positionMs: 0, durationMs: null }).catch(() => {})
    }
    video.addEventListener('pause', onPause)
    video.addEventListener('ended', onEnded)
    return () => {
      window.clearInterval(interval)
      video.removeEventListener('pause', onPause)
      video.removeEventListener('ended', onEnded)
      save(true)
    }
  }, [assetId])

  useEffect(() => {
    if (!thumbnailsUrl) {
      setCues([])
      setSpriteUrl('')
      return
    }
    let cancelled = false
    fetch(thumbnailsUrl)
      .then((r) => (r.ok ? r.text() : Promise.reject(new Error('vtt fetch failed'))))
      .then((text) => {
        if (cancelled) return
        const blocks = text.split(/\n\n+/)
        const parsed: ThumbCue[] = []
        let firstSprite = ''
        for (const block of blocks) {
          const m = CUE_PATTERN.exec(block)
          if (!m) continue
          const start = hmsToSec(m[1], m[2], m[3])
          const end = hmsToSec(m[4], m[5], m[6])
          const sprite = m[7]
          if (!firstSprite) firstSprite = sprite
          parsed.push({
            start,
            end,
            sprite,
            x: parseInt(m[8], 10),
            y: parseInt(m[9], 10),
            w: parseInt(m[10], 10),
            h: parseInt(m[11], 10),
          })
        }
        setCues(parsed)
        if (firstSprite) {
          const base = new URL(thumbnailsUrl, window.location.href)
          setSpriteUrl(new URL(firstSprite, base).toString())
        }
      })
      .catch(() => {
        if (!cancelled) {
          setCues([])
          setSpriteUrl('')
        }
      })
    return () => {
      cancelled = true
    }
  }, [thumbnailsUrl])

  const progressPct = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0
  const hoverCue = useMemo(() => {
    if (!hover) return null
    return cues.find((c) => hover.time >= c.start && hover.time < c.end) ?? null
  }, [hover, cues])

  function onStripMove(e: React.MouseEvent<HTMLDivElement>) {
    if (duration <= 0) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left))
    const t = (x / rect.width) * duration
    setHover({ x, time: t })
  }

  function onStripLeave() {
    setHover(null)
  }

  function onStripClick(e: React.MouseEvent<HTMLDivElement>) {
    const video = videoRef.current
    if (!video || duration <= 0) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left))
    video.currentTime = (x / rect.width) * duration
  }

  const handleAudioChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = parseInt(e.target.value, 10)
    if (hlsRef.current) hlsRef.current.audioTrack = id
    setActiveAudio(id)
  }
  const handleSubtitleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = parseInt(e.target.value, 10)
    if (hlsRef.current) hlsRef.current.subtitleTrack = id
    setActiveSubtitle(id)
  }

  return (
    <>
      {(audioTracks.length > 1 || subtitleTracks.length > 0) && (
        <div className="track-picker">
          {audioTracks.length > 1 && (
            <label>
              Audio
              <select value={activeAudio} onChange={handleAudioChange}>
                {audioTracks.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}{t.lang ? ` (${t.lang})` : ''}
                  </option>
                ))}
              </select>
            </label>
          )}
          {subtitleTracks.length > 0 && (
            <label>
              Subtitles
              <select value={activeSubtitle} onChange={handleSubtitleChange}>
                <option value={-1}>Off</option>
                {subtitleTracks.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}{t.lang ? ` (${t.lang})` : ''}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>
      )}
      <div className="video-wrap">
        {adActive && <div className="ad-overlay">AD · NOT SKIPPABLE</div>}
        {resumedFrom != null && (
          <div className="resume-overlay">resumed at {fmt(resumedFrom)}</div>
        )}
        <video ref={videoRef} controls playsInline />
      </div>
      {cues.length > 0 && spriteUrl && (
        <div
          ref={stripRef}
          className="trickplay-strip"
          onMouseMove={onStripMove}
          onMouseLeave={onStripLeave}
          onClick={onStripClick}
        >
          <div className="trickplay-track">
            <div className="trickplay-progress" style={{ width: `${progressPct}%` }} />
          </div>
          <div className="trickplay-label">
            <span>trick-play</span>
            <span>{fmt(currentTime)} / {fmt(duration)}</span>
          </div>
          {hover && hoverCue && (
            <div
              className="trickplay-preview"
              style={{ left: clampPreview(hover.x, stripRef.current?.clientWidth ?? 0, hoverCue.w) }}
            >
              <div
                className="trickplay-thumb"
                style={{
                  width: hoverCue.w,
                  height: hoverCue.h,
                  backgroundImage: `url(${spriteUrl})`,
                  backgroundPosition: `-${hoverCue.x}px -${hoverCue.y}px`,
                }}
              />
              <div className="trickplay-time">{fmt(hover.time)}</div>
            </div>
          )}
        </div>
      )}
    </>
  )
}

function extractAdDuration(data: unknown): number {
  const d = data as { dateRanges?: Record<string, { duration?: number }> } | undefined
  if (!d?.dateRanges) return 0
  for (const id of Object.keys(d.dateRanges)) {
    const dr = d.dateRanges[id]
    if (dr?.duration && dr.duration > 0) return dr.duration
  }
  return 0
}

function hmsToSec(h: string, m: string, s: string): number {
  return parseInt(h, 10) * 3600 + parseInt(m, 10) * 60 + parseFloat(s)
}

function fmt(sec: number): string {
  if (!Number.isFinite(sec) || sec < 0) return '0:00'
  const total = Math.floor(sec)
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  return h > 0
    ? `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    : `${m}:${s.toString().padStart(2, '0')}`
}

function clampPreview(x: number, stripW: number, thumbW: number): number {
  const half = thumbW / 2
  return Math.max(half, Math.min(stripW - half, x)) - half
}
