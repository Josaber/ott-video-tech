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

    // Region containing t (currently playing inside an ad).
    const regionAt = (t: number) =>
      adRegions.find((r) => t >= r.start && t < r.end)
    // Earliest ad region that BEGINS between maxWatched and target — i.e.,
    // an ad the user would skip past with a forward seek. Allows seeking
    // backwards or forward within already-watched space.
    const blockingAd = (target: number) =>
      target > maxWatched.current + 0.5
        ? adRegions.find((r) => r.start > maxWatched.current && r.start < target)
        : undefined

    const onTime = () => {
      if (video.currentTime > maxWatched.current) maxWatched.current = video.currentTime
      const r = regionAt(video.currentTime)
      if (r) {
        if (video.playbackRate > 1) video.playbackRate = 1
        if (!adActive) setAdActive(true)
      } else if (adActive) {
        setAdActive(false)
      }
    }
    const onSeeking = () => {
      const r = regionAt(video.currentTime)
      // Inside an ad region → snap back to where the user actually was
      // before the seek (maxWatched, capped at region.end so we don't
      // tunnel past the ad).
      if (r && video.currentTime > maxWatched.current + 0.5) {
        video.currentTime = Math.min(maxWatched.current, r.end - 0.1)
        return
      }
      // Forward seek that would skip an un-watched ad → snap to its start.
      // Advance maxWatched up to the ad start so the next seeking event
      // (the snap itself) doesn't re-trigger the "inside-ad past-maxWatched"
      // rule and bounce us back to t=0.
      const skipped = blockingAd(video.currentTime)
      if (skipped) {
        maxWatched.current = Math.max(maxWatched.current, skipped.start)
        video.currentTime = skipped.start
      }
    }
    const onRateChange = () => {
      if (regionAt(video.currentTime) && video.playbackRate > 1) {
        video.playbackRate = 1
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
    video.addEventListener('ratechange', onRateChange)
    video.addEventListener('keydown', onKey)
    return () => {
      video.removeEventListener('timeupdate', onTime)
      video.removeEventListener('seeking', onSeeking)
      video.removeEventListener('ratechange', onRateChange)
      video.removeEventListener('keydown', onKey)
    }
  }, [adRegions, adActive])

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

  const togglePip = async () => {
    const video = videoRef.current
    if (!video) return
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture()
      } else if (document.pictureInPictureEnabled) {
        await video.requestPictureInPicture()
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
      <div className="video-wrap">
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
