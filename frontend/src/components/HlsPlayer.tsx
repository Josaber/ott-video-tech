import { useEffect, useMemo, useRef, useState } from 'react'
import Hls from 'hls.js'
import { getToken } from '../api/auth'
import { api } from '../api/client'
import { useToast } from './Toast'

interface Props {
  src: string
  assetId?: string
  thumbnailsUrl?: string | null
  /** Optional initial seek position in seconds (program time). */
  initialSeekSeconds?: number
  /** Optional Up Next teaser shown in the last 15 s of the video. */
  upNext?: {
    title: string
    posterUrl?: string | null
    onPlay: () => void
  } | null
}

const PLAYBACK_RATES = [0.5, 0.75, 1, 1.25, 1.5, 2]

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
export function HlsPlayer({ src, assetId, thumbnailsUrl, initialSeekSeconds, upNext }: Props) {
  const toast = useToast()
  const videoRef = useRef<HTMLVideoElement>(null)
  const stripRef = useRef<HTMLDivElement>(null)
  // Multi-region: preroll pod + N mid-rolls. Each region carries its own
  // start, end, and id from EXT-X-DATERANGE. The single adActive flag stays
  // — it just becomes "in any ad region right now".
  const [adRegions, setAdRegions] = useState<{ start: number; end: number; id: string }[]>([])
  const [adActive, setAdActive] = useState<boolean>(false)
  const maxWatched = useRef<number>(0)
  const [cues, setCues] = useState<ThumbCue[]>([])
  const [spriteUrl, setSpriteUrl] = useState<string>('')
  const [duration, setDuration] = useState<number>(0)
  const [currentTime, setCurrentTime] = useState<number>(0)
  const [hover, setHover] = useState<{ x: number; time: number } | null>(null)
  const [resumedFrom, setResumedFrom] = useState<number | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [sessionError, setSessionError] = useState<{ limit: number } | null>(null)
  const sessionPending = useRef<boolean>(false)
  const resumeApplied = useRef<boolean>(false)
  const lastSavedMs = useRef<number>(-1)
  const hlsRef = useRef<Hls | undefined>(undefined)
  const [audioTracks, setAudioTracks] = useState<{ id: number; name: string; lang?: string }[]>([])
  const [activeAudio, setActiveAudio] = useState<number>(-1)
  const [subtitleTracks, setSubtitleTracks] = useState<{ id: number; name: string; lang?: string }[]>([])
  const [activeSubtitle, setActiveSubtitle] = useState<number>(-1)
  const [statsOpen, setStatsOpen] = useState<boolean>(false)
  const [throttleEndsAt, setThrottleEndsAt] = useState<number | null>(null)
  const [subStyleOpen, setSubStyleOpen] = useState<boolean>(false)
  // The user's CHOSEN speed. Distinct from video.playbackRate because the
  // ad guard forces 1× during ad regions; without separating intent from
  // actual rate, picking 1.5× would get nuked on entering a preroll and
  // never be restored when the ad ends.
  const [pinnedSpeed, setPinnedSpeed] = useState<number>(1)
  const [audioSyncOpen, setAudioSyncOpen] = useState<boolean>(false)
  const [audioSyncMs, setAudioSyncMs] = useState<number>(() => {
    const raw = localStorage.getItem('hls-player-audio-sync-ms')
    return raw ? parseFloat(raw) : 0
  })
  const audioCtxRef = useRef<{ ctx: AudioContext; delay: DelayNode } | null>(null)
  const [upNextActive, setUpNextActive] = useState<boolean>(false)
  const [upNextCountdown, setUpNextCountdown] = useState<number>(10)
  const [upNextCancelled, setUpNextCancelled] = useState<boolean>(false)
  const [subStyle, setSubStyle] = useState<{
    fontSize: number
    color: string
    bgOpacity: number
  }>(() => {
    try {
      const raw = localStorage.getItem('hls-player-cue-style')
      if (raw) return JSON.parse(raw)
    } catch { /* fall through */ }
    return { fontSize: 18, color: '#ffffff', bgOpacity: 0.7 }
  })
  const [pipActive, setPipActive] = useState<boolean>(false)
  const [airplayAvailable, setAirplayAvailable] = useState<boolean>(false)
  const wrapRef = useRef<HTMLDivElement>(null)
  const pipPlaceholderRef = useRef<HTMLDivElement | null>(null)
  const docPipWinRef = useRef<Window | null>(null)
  const [stats, setStats] = useState<{
    bandwidthKbps: number
    currentLevel: number
    fragsLoaded: number
    droppedFrames: number
    decodedFrames: number
    bufferAheadSec: number
    latencySec: number | null
  } | null>(null)
  const fragsLoadedRef = useRef<number>(0)
  const [playerError, setPlayerError] = useState<{
    kind: string
    details: string
    fatal: boolean
    retryAttempt: number
  } | null>(null)
  const networkRetries = useRef<number>(0)
  const mediaRetries = useRef<number>(0)
  const [levels, setLevels] = useState<{ id: number; label: string }[]>([])
  // User's pin: -1 = Auto (let hls.js's bandwidth-driven picker decide).
  // This drives the dropdown's selected option.
  const [pinnedLevel, setPinnedLevel] = useState<number>(-1)
  // hls.js's actual level currently playing — shown next to the dropdown so
  // the user can see what Auto picked. Stays in sync via LEVEL_SWITCHED.
  const [playingLevel, setPlayingLevel] = useState<number>(-1)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    // Wait for the playback session to settle before loading. If the
    // caller passed an assetId but we haven't got a session yet (and
    // haven't hit the limit), defer setup — the effect re-runs once
    // sessionId or sessionError flips.
    if (assetId && !sessionId && !sessionError) return
    if (sessionError) return

    maxWatched.current = 0
    setAdRegions([])
    setAdActive(false)
    setDuration(0)
    setCurrentTime(0)

    setAudioTracks([])
    setActiveAudio(-1)
    setSubtitleTracks([])
    setActiveSubtitle(-1)
    setLevels([])
    setPinnedLevel(-1)
    setPlayingLevel(-1)
    setPlayerError(null)
    networkRetries.current = 0
    mediaRetries.current = 0

    let hls: Hls | undefined
    if (Hls.isSupported()) {
      hls = new Hls({
        debug: false,
        // CTA-5004 Common Media Client Data. hls.js emits these as query
        // parameters (e.g. `?CMCD=ot%3Dv%2Cbr%3D2628%2Cbl%3D8500...`) on
        // every segment request; the cdn-service edge parses them out and
        // forwards a JSON beacon to /api/cmcd/ingest. Session id is per
        // HlsPlayer mount; content id binds the beacon to the asset.
        cmcd: assetId
          ? {
              sessionId: `hls-${Math.random().toString(36).slice(2, 10)}`,
              contentId: assetId,
              useHeaders: false,
            }
          : undefined,
        // Attach the Bearer token only to same-origin (backend) requests so
        // license.key is authenticated. Cross-origin requests (ad-service ts
        // segments) get no header — they don't accept auth anyway and we
        // avoid the CORS preflight cost.
        xhrSetup: (xhr, url) => {
          // Attach the Bearer to:
          //   - same-origin requests (backend, including relative "/" paths
          //     which hls.js does NOT normalize before calling xhrSetup), AND
          //   - cross-origin CDN edge requests (host:8095 in dev). The edge
          //     forwards the header to origin so per-viewer manifest mutation
          //     (license URI rewrite, watermark stitch) sees the right user.
          //   - NOT the ad-service: those endpoints don't accept Bearer and
          //     adding it would trigger a preflight per ts segment.
          const token = getToken()
          const sameOrigin = url.startsWith('/') || url.startsWith(window.location.origin)
          const isCdn = url.includes('/cdn/')
          if (token && (sameOrigin || isCdn)) {
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
        setLevels(h.levels.map((lv, i) => ({
          id: i,
          label: `${lv.height || '?'}p · ${Math.round((lv.bitrate || 0) / 1000)} kbps`,
        })))
        // h.autoLevelEnabled is true when currentLevel===-1; preserve the
        // user's pin instead of clobbering it with the just-switched level.
        setPinnedLevel(h.autoLevelEnabled ? -1 : h.currentLevel)
        setPlayingLevel(h.currentLevel)
      }
      hls.on(Hls.Events.MANIFEST_PARSED, refreshTracks)
      hls.on(Hls.Events.AUDIO_TRACKS_UPDATED, refreshTracks)
      hls.on(Hls.Events.SUBTITLE_TRACKS_UPDATED, refreshTracks)
      hls.on(Hls.Events.AUDIO_TRACK_SWITCHED, (_e, d) => setActiveAudio(d.id))
      hls.on(Hls.Events.SUBTITLE_TRACK_SWITCH, (_e, d) => setActiveSubtitle(d.id))
      // LEVEL_SWITCHED reflects which variant is now playing. In Auto mode
      // this fires every time hls.js's ABR algorithm picks a new tier — we
      // only update playingLevel, NEVER pinnedLevel, so the dropdown
      // doesn't appear to "stick" the user to Auto's last choice.
      hls.on(Hls.Events.LEVEL_SWITCHED, (_e, d) => setPlayingLevel(d.level))

      // Error handling. hls.js classifies into NETWORK / MEDIA / KEY / OTHER.
      // Standard recovery is: NETWORK fatal → startLoad() to retry; MEDIA
      // fatal → recoverMediaError() (re-attaches MediaSource); anything else
      // is fatal and surfaces as a manual-retry overlay.
      hls.on(Hls.Events.ERROR, (_e, data) => {
        const h = hlsRef.current
        if (!h || !data.fatal) return
        // First-shot recovery: one retry for network errors, one
        // recoverMediaError for media errors. If no FRAG_LOADED fires
        // within 5 s (signal of real recovery), escalate the transient
        // banner to a fatal "Playback failed" overlay with a manual
        // Try-again button.
        if (data.type === Hls.ErrorTypes.NETWORK_ERROR && networkRetries.current === 0) {
          networkRetries.current = 1
          setPlayerError({ kind: 'network', details: data.details, fatal: false, retryAttempt: 1 })
          h.startLoad()
          window.setTimeout(() => {
            setPlayerError((prev) => (prev && !prev.fatal ? { ...prev, fatal: true } : prev))
          }, 5000)
        } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR && mediaRetries.current === 0) {
          mediaRetries.current = 1
          setPlayerError({ kind: 'media', details: data.details, fatal: false, retryAttempt: 1 })
          h.recoverMediaError()
          window.setTimeout(() => {
            setPlayerError((prev) => (prev && !prev.fatal ? { ...prev, fatal: true } : prev))
          }, 5000)
        } else {
          setPlayerError({
            kind: data.type === Hls.ErrorTypes.KEY_SYSTEM_ERROR ? 'key-system' : data.type.toLowerCase(),
            details: data.details,
            fatal: true,
            retryAttempt: data.type === Hls.ErrorTypes.NETWORK_ERROR ? networkRetries.current : mediaRetries.current,
          })
        }
      })
      // FRAG_LOADED is the cleanest "real progress" signal — clear any
      // transient error banner the moment a segment lands, and bump the
      // stats counter.
      hls.on(Hls.Events.FRAG_LOADED, () => {
        setPlayerError((prev) => (prev && !prev.fatal ? null : prev))
        fragsLoadedRef.current += 1
      })
      const collectAdRegions = (data: unknown) => {
        // hls.js exposes parsed DATERANGEs on data.dateRanges keyed by id.
        // Each entry has startDate (Date) and duration (seconds). Preroll
        // pod has startDate=1970-01-01T00:00:00, midroll-N has the absolute
        // start time we emitted server-side.
        const d = data as {
          dateRanges?: Record<
            string,
            { duration?: number; startDate?: Date | string }
          >
        } | undefined
        if (!d?.dateRanges) return
        const epoch0 = new Date('1970-01-01T00:00:00.000Z').getTime()
        const regions: { start: number; end: number; id: string }[] = []
        for (const id of Object.keys(d.dateRanges)) {
          const dr = d.dateRanges[id]
          const dur = dr?.duration ?? 0
          if (dur <= 0) continue
          const sd = dr?.startDate ? new Date(dr.startDate as Date | string).getTime() : epoch0
          const start = Math.max(0, (sd - epoch0) / 1000)
          regions.push({ start, end: start + dur, id })
        }
        regions.sort((a, b) => a.start - b.start)
        if (regions.length > 0) {
          setAdRegions(regions)
          // First region might be at t=0 — mark active so the overlay
          // shows before timeupdate fires.
          if (regions[0].start === 0) setAdActive(true)
        }
      }
      hls.on(Hls.Events.MANIFEST_PARSED, (_e, data) => collectAdRegions(data))
      hls.on(Hls.Events.LEVEL_LOADED, (_e, data) => {
        const rawManifest = (data as { details: { fragments: unknown[]; dateRanges?: unknown } }).details
        // hls.js v1.5+ exposes parsed dateRanges on details — prefer that.
        if (rawManifest.dateRanges) {
          collectAdRegions({ dateRanges: rawManifest.dateRanges })
          return
        }
        // Legacy fallback: parse EXT-X-DATERANGE off the fragments' tagList.
        const fragments = rawManifest.fragments as { tagList?: string[][] }[]
        const dateRangeTags = fragments.flatMap((f) => f.tagList ?? [])
            .filter((t) => Array.isArray(t) && t[0] === 'EXT-X-DATERANGE')
        const epoch0 = new Date('1970-01-01T00:00:00.000Z').getTime()
        const regions: { start: number; end: number; id: string }[] = []
        for (const t of dateRangeTags) {
          const body = t[1] ?? ''
          const idMatch = /ID="([^"]+)"/.exec(body)
          const startMatch = /START-DATE="([^"]+)"/.exec(body)
          const durMatch = /DURATION=([0-9.]+)/.exec(body)
          if (!durMatch) continue
          const dur = parseFloat(durMatch[1])
          if (dur <= 0) continue
          const id = idMatch ? idMatch[1] : `ad-${regions.length}`
          const start = startMatch ? Math.max(0, (new Date(startMatch[1]).getTime() - epoch0) / 1000) : 0
          regions.push({ start, end: start + dur, id })
        }
        regions.sort((a, b) => a.start - b.start)
        if (regions.length > 0) {
          setAdRegions(regions)
          if (regions[0].start === 0) setAdActive(true)
        }
      })
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src
    }
    return () => {
      hls?.destroy()
    }
  }, [src, sessionId, sessionError, assetId])

  useEffect(() => {
    const video = videoRef.current
    if (!video || adRegions.length === 0) return

    const regionAt = (t: number) =>
      adRegions.find((r) => t >= r.start && t < r.end)

    const onTime = () => {
      if (video.currentTime > maxWatched.current) maxWatched.current = video.currentTime
      const r = regionAt(video.currentTime)
      if (r) {
        if (!adActive) setAdActive(true)
      } else if (adActive) {
        setAdActive(false)
      }
    }

    // Unified seek policy for ALL navigation actions (scrub bar, ±10 s
    // buttons, share-link initial seek, hls.js auto-correction, native
    // keyboard) — they all flow through this single seeking handler.
    //
    // Cases:
    //   Forward (t > maxWatched): if any ad region sits between
    //     maxWatched and target whose end is past maxWatched (i.e. still
    //     un-watched), snap to ad.start so the user must watch it.
    //   Landing in a WATCHED ad (maxWatched ≥ ad.end): snap to the
    //     program-side boundary just past the ad — the user typically
    //     went there from a backward seek and doesn't want to be inside
    //     an already-played ad.
    const onSeeking = () => {
      const t = video.currentTime
      if (t > maxWatched.current + 0.5) {
        const blocking = adRegions.find((rg) =>
          rg.end > maxWatched.current && rg.start < t
        )
        if (blocking) {
          const newPos = Math.max(blocking.start, maxWatched.current)
          const clamped = Math.min(newPos, blocking.end - 0.1)
          maxWatched.current = Math.max(maxWatched.current, clamped)
          video.currentTime = clamped
          return
        }
      }
      const r = regionAt(t)
      if (r && maxWatched.current >= r.end - 0.1) {
        // Inside an ad we've already finished — push to post-ad.
        const dur = Number.isFinite(video.duration) ? video.duration : r.end + 1
        video.currentTime = Math.min(dur, r.end + 0.05)
      }
    }

    const onKey = (e: KeyboardEvent) => {
      if (regionAt(video.currentTime)) {
        if (['ArrowRight', 'ArrowUp', 'l', 'L', '.', '>'].includes(e.key)) {
          e.preventDefault()
          e.stopPropagation()
        }
      }
    }
    video.addEventListener('timeupdate', onTime)
    video.addEventListener('seeking', onSeeking)
    video.addEventListener('keydown', onKey)
    return () => {
      video.removeEventListener('timeupdate', onTime)
      video.removeEventListener('seeking', onSeeking)
      video.removeEventListener('keydown', onKey)
    }
  }, [adRegions, adActive])

  // Speed picker persistence across ad regions. The video element's
  // playbackRate is forced to 1 during ads (so ads can't be sped through)
  // but the user's pinned choice survives — when the ad ends, the rate
  // restores. Without this split, picking 1.5× would get nuked on the
  // first preroll and never come back.
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    const target = adActive ? 1 : pinnedSpeed
    if (Math.abs(video.playbackRate - target) > 0.01) {
      video.playbackRate = target
    }
  }, [pinnedSpeed, adActive])

  // Inject a `<style>` block applying the user's chosen ::cue styles.
  // ::cue is the W3C standard pseudo-element for WebVTT cue text; both
  // text-track cues parsed by hls.js and native <track> cues respect it.
  // Saved in localStorage so the preference persists across sessions.
  useEffect(() => {
    try { localStorage.setItem('hls-player-cue-style', JSON.stringify(subStyle)) } catch { /* swallow */ }
    const STYLE_ID = 'hls-player-cue-style-tag'
    let tag = document.getElementById(STYLE_ID) as HTMLStyleElement | null
    if (!tag) {
      tag = document.createElement('style')
      tag.id = STYLE_ID
      document.head.appendChild(tag)
    }
    const bg = `rgba(0, 0, 0, ${subStyle.bgOpacity.toFixed(2)})`
    tag.textContent = `
      video::cue {
        font-size: ${subStyle.fontSize}px;
        color: ${subStyle.color};
        background: ${bg};
        line-height: 1.3;
        text-shadow: 0 1px 2px rgba(0,0,0,0.85);
      }
    `
  }, [subStyle])

  // Up Next: during the last 15 s of program playback, show the teaser
  // overlay. A 10-second countdown auto-rolls into the next asset unless
  // the user clicks Cancel. Resets state when the asset changes.
  useEffect(() => {
    setUpNextActive(false)
    setUpNextCancelled(false)
    setUpNextCountdown(10)
  }, [src])
  useEffect(() => {
    const video = videoRef.current
    if (!video || !upNext || upNextCancelled) return
    const onTime = () => {
      const dur = video.duration
      if (!Number.isFinite(dur) || dur <= 0) return
      const remaining = dur - video.currentTime
      if (remaining <= 15 && !upNextActive) {
        setUpNextActive(true)
        setUpNextCountdown(10)
      } else if (remaining > 15 && upNextActive) {
        setUpNextActive(false)
      }
    }
    video.addEventListener('timeupdate', onTime)
    return () => video.removeEventListener('timeupdate', onTime)
  }, [upNext, upNextActive, upNextCancelled])
  useEffect(() => {
    if (!upNextActive || !upNext) return
    if (upNextCountdown <= 0) {
      upNext.onPlay()
      setUpNextActive(false)
      return
    }
    const t = window.setTimeout(() => setUpNextCountdown((n) => n - 1), 1000)
    return () => window.clearTimeout(t)
  }, [upNextActive, upNextCountdown, upNext])

  // Volume memory: persist last-used volume + muted state in localStorage.
  // Browser default is full-volume + unmuted; for users who manually drop
  // to 30% once, every subsequent asset should remember.
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    const raw = localStorage.getItem('hls-player-volume')
    if (raw) {
      try {
        const { v, m } = JSON.parse(raw)
        if (typeof v === 'number') video.volume = Math.max(0, Math.min(1, v))
        if (typeof m === 'boolean') video.muted = m
      } catch { /* ignore */ }
    }
    const onVol = () => {
      localStorage.setItem('hls-player-volume', JSON.stringify({
        v: video.volume, m: video.muted,
      }))
    }
    video.addEventListener('volumechange', onVol)
    return () => video.removeEventListener('volumechange', onVol)
  }, [src])

  // Audio sync offset via Web Audio DelayNode. Positive ms = audio plays
  // LATER (compensates for video that lags audio). Negative is not
  // implementable purely on the audio side — would need video delay too,
  // which the browser doesn't expose; UI is clamped to 0..500 ms.
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    if (audioSyncMs <= 0) {
      // Tear down the audio graph if user reset; the video plays through
      // its native audio output.
      if (audioCtxRef.current) {
        audioCtxRef.current.ctx.close().catch(() => {})
        audioCtxRef.current = null
      }
      return
    }
    if (!audioCtxRef.current) {
      try {
        const AC: typeof AudioContext =
          (window as unknown as { AudioContext: typeof AudioContext; webkitAudioContext?: typeof AudioContext })
            .AudioContext ??
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
        const ctx = new AC()
        const source = ctx.createMediaElementSource(video)
        const delay = ctx.createDelay(2)
        source.connect(delay).connect(ctx.destination)
        audioCtxRef.current = { ctx, delay }
      } catch {
        // createMediaElementSource throws if called twice on the same
        // element. Bail; user will see the slider not work but no crash.
        return
      }
    }
    audioCtxRef.current.delay.delayTime.value = audioSyncMs / 1000
    localStorage.setItem('hls-player-audio-sync-ms', String(audioSyncMs))
  }, [audioSyncMs, src])

  // Initial seek from a share-at-timestamp URL. The value is PROGRAM time
  // (what the user actually shared); we add the preroll offset (constant
  // for the demo) to put the playhead in the right spot on the stitched
  // timeline. Applied once on loadedmetadata.
  useEffect(() => {
    if (!initialSeekSeconds || initialSeekSeconds <= 0) return
    const video = videoRef.current
    if (!video) return
    const apply = () => {
      const PREROLL_OFFSET = 16  // matches SsaiProperties.prerollPodDurationSeconds
      video.currentTime = initialSeekSeconds + PREROLL_OFFSET
      maxWatched.current = video.currentTime
    }
    if (video.readyState >= 1) apply()
    video.addEventListener('loadedmetadata', apply, { once: true })
    return () => video.removeEventListener('loadedmetadata', apply)
  }, [initialSeekSeconds, src])

  // PiP enter/leave events come from the DOM, not from our buttons,
  // since the user can also leave PiP via the OS UI.
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    const onEnter = () => setPipActive(true)
    const onLeave = () => setPipActive(false)
    video.addEventListener('enterpictureinpicture', onEnter)
    video.addEventListener('leavepictureinpicture', onLeave)
    return () => {
      video.removeEventListener('enterpictureinpicture', onEnter)
      video.removeEventListener('leavepictureinpicture', onLeave)
    }
  }, [])

  // AirPlay availability is a Safari-specific event. The button only
  // renders if a target (Apple TV / HomePod / etc.) is currently visible.
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    interface AirPlayEvent extends Event { availability?: string }
    const handler = (e: Event) => {
      const av = (e as AirPlayEvent).availability
      setAirplayAvailable(av === 'available')
    }
    type WkVideo = HTMLVideoElement & {
      webkitShowPlaybackTargetPicker?: () => void
    }
    const v = video as WkVideo
    if ('webkitShowPlaybackTargetPicker' in v) {
      video.addEventListener('webkitplaybacktargetavailabilitychanged', handler)
    }
    return () => {
      video.removeEventListener('webkitplaybacktargetavailabilitychanged', handler)
    }
  }, [])

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

  // Acquire a playback session before the player loads. If the user is
  // at the concurrent-stream limit, this resolves with sessionError set
  // and we skip rendering the video entirely.
  useEffect(() => {
    if (!assetId) return
    sessionPending.current = true
    setSessionId(null)
    setSessionError(null)
    let cancelled = false
    let acquiredId: string | null = null
    api.openSession(assetId).then((result) => {
      if (cancelled) {
        if ('sessionId' in result) {
          // race: we got a session but the component already moved on; release it.
          api.closeSession(result.sessionId).catch(() => {})
        }
        return
      }
      if ('error' in result) {
        setSessionError({ limit: result.limit })
      } else {
        acquiredId = result.sessionId
        setSessionId(result.sessionId)
      }
    }).catch(() => {
      if (!cancelled) setSessionError({ limit: 2 })
    }).finally(() => {
      sessionPending.current = false
    })
    return () => {
      cancelled = true
      if (acquiredId) api.closeSession(acquiredId).catch(() => {})
    }
  }, [assetId])

  // Stats overlay tick — only when the user has toggled the panel open.
  // Reads hls.js's bandwidthEstimate + currentLevel + buffer state, and
  // the native video element's playback quality counters.
  useEffect(() => {
    if (!statsOpen) {
      setStats(null)
      return
    }
    const id = window.setInterval(() => {
      const video = videoRef.current
      const h = hlsRef.current
      if (!video) return
      const buffered = video.buffered
      const tail = buffered.length > 0 ? buffered.end(buffered.length - 1) : video.currentTime
      const bufferAhead = Math.max(0, tail - video.currentTime)
      // getVideoPlaybackQuality is the standard cross-browser frame counter.
      const q = typeof video.getVideoPlaybackQuality === 'function'
        ? video.getVideoPlaybackQuality()
        : null
      setStats({
        bandwidthKbps: h ? Math.round(h.bandwidthEstimate / 1000) : 0,
        currentLevel: h ? h.currentLevel : -1,
        fragsLoaded: fragsLoadedRef.current,
        droppedFrames: q?.droppedVideoFrames ?? 0,
        decodedFrames: q?.totalVideoFrames ?? 0,
        bufferAheadSec: bufferAhead,
        latencySec: h && h.latency != null ? h.latency : null,
      })
    }, 500)
    return () => window.clearInterval(id)
  }, [statsOpen])

  // Heartbeat every 30 s while the session is open. Backend reaps anything
  // > 90 s stale on the next session-open attempt.
  useEffect(() => {
    if (!sessionId) return
    const id = window.setInterval(() => {
      api.heartbeatSession(sessionId).catch(() => {})
    }, 30000)
    return () => window.clearInterval(id)
  }, [sessionId])

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
  const handleLevelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = parseInt(e.target.value, 10)
    if (hlsRef.current) hlsRef.current.currentLevel = id
    setPinnedLevel(id)
  }
  // Skip ±N seconds. Disabled during ads — UI gates this with `disabled`,
  // handler short-circuits as defense in depth.
  const skip = (deltaSec: number) => {
    if (adActive) return
    const video = videoRef.current
    if (!video) return
    const target = Math.max(0, Math.min(video.duration || 0, video.currentTime + deltaSec))
    video.currentTime = target
  }

  const handleSpeedChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (adActive) return
    setPinnedSpeed(parseFloat(e.target.value))
  }

  const restartFromStart = async () => {
    if (adActive) return
    const video = videoRef.current
    if (!video) return
    video.currentTime = 0
    maxWatched.current = 0
    if (assetId) {
      try { await api.deleteProgress(assetId) } catch { /* swallow */ }
    }
    toast.push('success', 'Restarted from beginning')
  }

  const shareAtTimestamp = async () => {
    const video = videoRef.current
    if (!video || !assetId) return
    // Stitched → program time so the link survives ad-pod changes.
    const PREROLL_OFFSET = 16
    const programT = Math.max(0, video.currentTime - PREROLL_OFFSET)
    const url = `${window.location.origin}/#/console?asset=${assetId}&t=${programT.toFixed(1)}`
    try {
      await navigator.clipboard.writeText(url)
      toast.push('success', 'Share link copied to clipboard')
    } catch {
      toast.push('error', 'Could not copy to clipboard')
    }
  }

  // Quick visual ABR demo: slam the bandwidth estimate way down + pin
  // currentLevel to the lowest tier, then release after 8 s. The player
  // visibly drops to 240p, then climbs back to whatever ABR picks
  // post-release. Doesn't actually throttle the network — that needs
  // Service Worker or DevTools — but the user-facing UX is the same:
  // see Auto mode adapt.
  const simulateSlowNetwork = () => {
    const h = hlsRef.current
    if (!h || levels.length === 0) return
    const DURATION_MS = 8000
    h.bandwidthEstimate = 200_000
    h.currentLevel = 0
    setPinnedLevel(0)
    const endsAt = Date.now() + DURATION_MS
    setThrottleEndsAt(endsAt)
    window.setTimeout(() => {
      const hh = hlsRef.current
      if (hh) {
        hh.currentLevel = -1
        setPinnedLevel(-1)
      }
      setThrottleEndsAt(null)
    }, DURATION_MS)
  }

  // Prefer Document Picture-in-Picture (Chrome 116+) — it pops the WHOLE
  // video-wrap DOM out, so subtitles, the AD overlay, the bitrate
  // chip, and the stats panel all follow into the floating window.
  // Falls back to the native `<video>.requestPictureInPicture()` on
  // older Chromes / Safari, where only the video plane goes — subtitles
  // and overlays stay behind on the page.
  type DocPipApi = {
    requestWindow(opts?: { width?: number; height?: number }): Promise<Window>
  }
  const docPip = typeof window !== 'undefined'
    ? (window as unknown as { documentPictureInPicture?: DocPipApi }).documentPictureInPicture
    : undefined

  const exitDocPip = () => {
    const win = docPipWinRef.current
    if (!win) return
    win.close()
  }

  const togglePip = async () => {
    const video = videoRef.current
    if (!video) return
    try {
      if (docPip) {
        if (docPipWinRef.current) {
          exitDocPip()
          return
        }
        const wrap = wrapRef.current
        if (!wrap || !wrap.parentNode) return
        const win = await docPip.requestWindow({ width: 640, height: 360 })
        // Copy stylesheets so the popout window picks up our ::cue rules,
        // overlays, and trick-play CSS — the popout starts blank.
        document.head
          .querySelectorAll('style, link[rel="stylesheet"]')
          .forEach((node) => win.document.head.appendChild(node.cloneNode(true)))
        win.document.body.style.margin = '0'
        win.document.body.style.background = '#000'
        // Leave a placeholder so we can restore the wrap to the same spot.
        const placeholder = win.document.createElement('div')
        pipPlaceholderRef.current = document.createElement('div')
        wrap.parentNode.insertBefore(pipPlaceholderRef.current, wrap)
        win.document.body.appendChild(wrap)
        docPipWinRef.current = win
        setPipActive(true)
        const onClose = () => {
          if (pipPlaceholderRef.current && wrap) {
            pipPlaceholderRef.current.parentNode?.insertBefore(wrap, pipPlaceholderRef.current)
            pipPlaceholderRef.current.remove()
            pipPlaceholderRef.current = null
          }
          docPipWinRef.current = null
          setPipActive(false)
        }
        win.addEventListener('pagehide', onClose)
        // Defensive: also bind unload in case pagehide doesn't fire.
        win.addEventListener('unload', onClose)
        // Silence the placeholder var lint (placeholder is created above
        // for the popout document; we keep it just so Chrome doesn't
        // empty-render the body on first paint).
        void placeholder
      } else if (document.pictureInPictureEnabled) {
        if (document.pictureInPictureElement) {
          await document.exitPictureInPicture()
        } else {
          // Make sure the active subtitle track is in 'showing' mode —
          // Chrome's video PiP only renders text tracks that are showing.
          const tracks = video.textTracks
          for (let i = 0; i < tracks.length; i++) {
            if (tracks[i].kind === 'subtitles' && hlsRef.current?.subtitleTrack === i) {
              tracks[i].mode = 'showing'
            }
          }
          await video.requestPictureInPicture()
        }
      }
    } catch {
      /* user can dismiss; ignore */
    }
  }
  const requestAirplay = () => {
    type WkVideo = HTMLVideoElement & {
      webkitShowPlaybackTargetPicker?: () => void
    }
    const v = videoRef.current as WkVideo | null
    v?.webkitShowPlaybackTargetPicker?.()
  }
  const pipSupported = typeof document !== 'undefined' && document.pictureInPictureEnabled

  const handleManualRetry = () => {
    networkRetries.current = 0
    mediaRetries.current = 0
    setPlayerError(null)
    const h = hlsRef.current
    if (h) {
      h.recoverMediaError()
      h.startLoad()
    }
  }

  if (sessionError) {
    return (
      <div className="stream-limit">
        <strong>Max streams reached.</strong>
        <div>
          This account is already watching on {sessionError.limit} other device{sessionError.limit === 1 ? '' : 's'}.
          Stop one of them to start another stream.
        </div>
      </div>
    )
  }

  return (
    <>
      {(audioTracks.length > 1 || subtitleTracks.length > 0 || levels.length > 1) && (
        <div className="track-picker">
          {levels.length > 1 && (
            <label>
              Quality
              <select value={pinnedLevel} onChange={handleLevelChange}>
                <option value={-1}>Auto</option>
                {levels.map((l) => (
                  <option key={l.id} value={l.id}>{l.label}</option>
                ))}
              </select>
            </label>
          )}
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
      <div className="video-wrap" ref={wrapRef}>
        {playerError && playerError.fatal && (
          <div className="player-error-fatal">
            <strong>Playback failed</strong>
            <div className="player-error-detail">
              {playerError.kind} · {playerError.details}
            </div>
            <button onClick={handleManualRetry}>Try again</button>
          </div>
        )}
        {playerError && !playerError.fatal && (
          <div className="player-error-transient">
            {playerError.kind === 'network' ? 'Network glitch' : 'Decoder hiccup'}
            <span> · retrying ({playerError.retryAttempt}/{playerError.kind === 'network' ? 3 : 1})</span>
          </div>
        )}
        {adActive && <div className="ad-overlay">AD · NOT SKIPPABLE</div>}
        {resumedFrom != null && (
          <div className="resume-overlay">resumed at {fmt(resumedFrom)}</div>
        )}
        {levels.length > 1 && playingLevel >= 0 && levels[playingLevel] && (
          <div className="bitrate-overlay">
            {pinnedLevel === -1 && <span className="bitrate-mode">AUTO</span>}
            {levels[playingLevel].label}
          </div>
        )}
        <div className="extra-controls">
          {pipSupported && (
            <button
              type="button"
              className="extra-btn"
              title={pipActive ? 'Exit picture-in-picture' : 'Picture-in-picture'}
              onClick={togglePip}
            >
              {pipActive ? '◱ exit pip' : '◰ pip'}
            </button>
          )}
          {airplayAvailable && (
            <button
              type="button"
              className="extra-btn"
              title="AirPlay"
              onClick={requestAirplay}
            >
              📡 airplay
            </button>
          )}
          {levels.length > 1 && (
            <button
              type="button"
              className="extra-btn"
              title="Simulate slow network — pin ABR to lowest tier for 8 s"
              onClick={simulateSlowNetwork}
              disabled={throttleEndsAt !== null}
            >
              {throttleEndsAt !== null ? '🐌 throttling' : '🐌 slow net'}
            </button>
          )}
          {subtitleTracks.length > 0 && (
            <button
              type="button"
              className="extra-btn"
              title="Subtitle appearance"
              onClick={() => {
                setSubStyleOpen((v) => !v)
                setStatsOpen(false)
              }}
            >
              {subStyleOpen ? '× cc' : '⚙ cc'}
            </button>
          )}
          <button
            type="button"
            className="extra-btn"
            title="Toggle playback stats"
            onClick={() => {
              setStatsOpen((v) => !v)
              setSubStyleOpen(false)
            }}
          >
            {statsOpen ? '× stats' : '📊 stats'}
          </button>
        </div>
        {subStyleOpen && (
          <div className="sub-style-panel">
            <div className="sub-style-row">
              <label>font size</label>
              <input
                type="range" min={12} max={32} step={1}
                value={subStyle.fontSize}
                onChange={(e) => setSubStyle((s) => ({ ...s, fontSize: parseInt(e.target.value, 10) }))}
              />
              <span>{subStyle.fontSize}px</span>
            </div>
            <div className="sub-style-row">
              <label>color</label>
              <input
                type="color"
                value={subStyle.color}
                onChange={(e) => setSubStyle((s) => ({ ...s, color: e.target.value }))}
              />
            </div>
            <div className="sub-style-row">
              <label>bg opacity</label>
              <input
                type="range" min={0} max={1} step={0.05}
                value={subStyle.bgOpacity}
                onChange={(e) => setSubStyle((s) => ({ ...s, bgOpacity: parseFloat(e.target.value) }))}
              />
              <span>{Math.round(subStyle.bgOpacity * 100)}%</span>
            </div>
            <div className="sub-style-row">
              <button
                type="button"
                className="extra-btn"
                onClick={() => setSubStyle({ fontSize: 18, color: '#ffffff', bgOpacity: 0.7 })}
              >reset</button>
            </div>
          </div>
        )}
        {statsOpen && stats && (
          <div className="stats-overlay">
            <div className="stats-row"><span>bandwidth</span><span>{stats.bandwidthKbps} kbps</span></div>
            <div className="stats-row"><span>tier</span><span>{stats.currentLevel >= 0 && levels[stats.currentLevel] ? levels[stats.currentLevel].label : '?'}</span></div>
            <div className="stats-row"><span>frags loaded</span><span>{stats.fragsLoaded}</span></div>
            <div className="stats-row"><span>frames</span><span>{stats.decodedFrames - stats.droppedFrames}/{stats.decodedFrames}</span></div>
            <div className="stats-row"><span>dropped</span><span>{stats.droppedFrames}</span></div>
            <div className="stats-row"><span>buffer</span><span>{stats.bufferAheadSec.toFixed(1)} s</span></div>
            {stats.latencySec != null && (
              <div className="stats-row"><span>latency</span><span>{stats.latencySec.toFixed(2)} s</span></div>
            )}
          </div>
        )}
        <video ref={videoRef} controls playsInline />
        {upNextActive && upNext && (
          <div className="upnext-overlay">
            {upNext.posterUrl && (
              <img className="upnext-poster" src={upNext.posterUrl} alt="" />
            )}
            <div className="upnext-text">
              <div className="upnext-eyebrow">Up next in {upNextCountdown}s</div>
              <div className="upnext-title">{upNext.title}</div>
              <div className="upnext-actions">
                <button type="button" onClick={() => { upNext.onPlay(); setUpNextActive(false) }}>
                  Play now
                </button>
                <button type="button" className="secondary" onClick={() => { setUpNextCancelled(true); setUpNextActive(false) }}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className={`action-controls-bar${adActive ? ' is-ad-locked' : ''}`}>
        <button
          type="button"
          className="extra-btn"
          title={adActive ? 'Disabled during ads' : 'Skip back 10 s'}
          onClick={() => skip(-10)}
          disabled={adActive}
        >⏪ 10s</button>
        <button
          type="button"
          className="extra-btn"
          title={adActive ? 'Disabled during ads' : 'Skip forward 10 s'}
          onClick={() => skip(10)}
          disabled={adActive}
        >10s ⏩</button>
        <label className="action-speed">
          speed
          <select
            value={pinnedSpeed}
            onChange={handleSpeedChange}
            disabled={adActive}
            title={adActive ? 'Disabled during ads' : 'Playback speed (persists across ad regions)'}
          >
            {PLAYBACK_RATES.map((r) => (
              <option key={r} value={r}>{r}×</option>
            ))}
          </select>
        </label>
        {assetId && (
          <>
            <button type="button" className="extra-btn" title="Copy share link at current time" onClick={shareAtTimestamp}>🔗 share at t</button>
            <button
              type="button"
              className="extra-btn"
              title={adActive ? 'Disabled during ads' : 'Restart from beginning'}
              onClick={restartFromStart}
              disabled={adActive}
            >↺ restart</button>
          </>
        )}
        <button
          type="button"
          className="extra-btn"
          title="Audio / video sync offset"
          onClick={() => setAudioSyncOpen((v) => !v)}
        >
          {audioSyncOpen ? '× a/v sync' : '🎧 a/v sync'}
        </button>
        {audioSyncMs > 0 && (
          <span className="action-badge">audio +{audioSyncMs}ms</span>
        )}
      </div>
      {audioSyncOpen && (
        <div className="audio-sync-panel-bar">
          <label>
            delay audio (ms)
            <input
              type="range" min={0} max={500} step={10}
              value={audioSyncMs}
              onChange={(e) => setAudioSyncMs(parseFloat(e.target.value))}
            />
            <span>{audioSyncMs} ms</span>
          </label>
          <p>Positive only — delays the audio via Web Audio DelayNode for users whose video lags audio.</p>
        </div>
      )}
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
