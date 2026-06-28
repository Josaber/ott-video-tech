import { MutableRefObject, RefObject, useEffect, useRef, useState } from 'react'
import Hls from 'hls.js'
import { getToken } from '../../../api/auth'
import { AdRegion } from './useAdGuard'
import { DateRangeMap, parseDateRanges, parseDateRangeTags } from './adRegions'
import { PlayerErrorState } from '../PlayerErrorOverlay'

interface Track { id: number; name: string; lang?: string }
interface Level { id: number; label: string }

/**
 * Owns the hls.js instance for the lifetime of (`src`, `sessionId`,
 * `sessionError`, `assetId`). Wires every hls.js event we care about:
 *
 *   MANIFEST_PARSED / LEVEL_LOADED → ad-region extraction from
 *      EXT-X-DATERANGE (parsed `dateRanges` on hls.js v1.5+; falls
 *      back to scraping the raw EXT-X-DATERANGE tags off the fragments
 *      for older versions)
 *   AUDIO_TRACKS_UPDATED / SUBTITLE_TRACKS_UPDATED → mirror picker state
 *   AUDIO_TRACK_SWITCHED / SUBTITLE_TRACK_SWITCH → active track changes
 *   LEVEL_SWITCHED → playingLevel (NEVER pinnedLevel — that would clobber
 *      the user's "-1 = Auto" pin every time ABR transitioned)
 *   ERROR → one-shot recovery (startLoad / recoverMediaError), escalate
 *      to a fatal overlay if no FRAG_LOADED fires within 5 s
 *   FRAG_LOADED → clear transient error banner + bump frags counter
 *
 * The `xhrSetup` attaches Bearer to same-origin AND cdn (host:8095)
 * requests — both the backend's signed-license URI and the CDN edge's
 * per-viewer manifest mutation need to know who's calling.
 */
export function useHlsLifecycle({
  videoRef,
  src,
  assetId,
  sessionId,
  sessionError,
  maxWatchedRef,
  resetTransientUiState,
}: {
  videoRef: RefObject<HTMLVideoElement | null>
  src: string
  assetId?: string
  sessionId: string | null
  sessionError: { limit: number } | null
  maxWatchedRef: MutableRefObject<number>
  /** Called once per src change so the parent can reset its own UI bits
   *  (currentTime, duration, etc.) at the same moment as the hook resets
   *  its own. Lets the hook stay decoupled from useDurationCurrentTime. */
  resetTransientUiState?: () => void
}) {
  const hlsRef = useRef<Hls | undefined>(undefined)
  const fragsLoadedRef = useRef<number>(0)
  const networkRetries = useRef<number>(0)
  const mediaRetries = useRef<number>(0)

  const [adRegions, setAdRegions] = useState<AdRegion[]>([])
  // Re-seeded by useAdGuard once timeupdate confirms; we ALSO seed here
  // because the very first region may sit at t=0 (preroll) and we want
  // the overlay up before the first timeupdate fires.
  const [adActiveSeed, setAdActiveSeed] = useState<boolean>(false)

  const [audioTracks, setAudioTracks] = useState<Track[]>([])
  const [activeAudio, setActiveAudio] = useState<number>(-1)
  const [subtitleTracks, setSubtitleTracks] = useState<Track[]>([])
  const [activeSubtitle, setActiveSubtitle] = useState<number>(-1)
  const [levels, setLevels] = useState<Level[]>([])
  const [pinnedLevel, setPinnedLevel] = useState<number>(-1)
  const [playingLevel, setPlayingLevel] = useState<number>(-1)
  const [playerError, setPlayerError] = useState<PlayerErrorState | null>(null)
  const [throttleEndsAt, setThrottleEndsAt] = useState<number | null>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    // Wait for the playback session to settle before loading. If the
    // caller passed an assetId but we haven't got a session yet (and
    // haven't hit the limit), defer setup — the effect re-runs once
    // sessionId or sessionError flips.
    if (assetId && !sessionId && !sessionError) return
    if (sessionError) return

    maxWatchedRef.current = 0
    setAdRegions([])
    setAdActiveSeed(false)
    resetTransientUiState?.()

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
        cmcd: assetId
          ? {
              sessionId: `hls-${Math.random().toString(36).slice(2, 10)}`,
              contentId: assetId,
              useHeaders: false,
            }
          : undefined,
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

      // Error handling — see file-level comment for the policy.
      hls.on(Hls.Events.ERROR, (_e, data) => {
        const h = hlsRef.current
        if (!h || !data.fatal) return
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
      hls.on(Hls.Events.FRAG_LOADED, () => {
        setPlayerError((prev) => (prev && !prev.fatal ? null : prev))
        fragsLoadedRef.current += 1
      })

      const applyRegions = (regions: AdRegion[]) => {
        if (regions.length === 0) return
        setAdRegions(regions)
        // Preroll pod often sits at t=0; flag the overlay as active
        // before the first timeupdate fires so it doesn't flash empty.
        if (regions[0].start === 0) setAdActiveSeed(true)
      }
      hls.on(Hls.Events.MANIFEST_PARSED, (_e, data) => {
        const d = data as { dateRanges?: DateRangeMap }
        applyRegions(parseDateRanges(d.dateRanges))
      })
      hls.on(Hls.Events.LEVEL_LOADED, (_e, data) => {
        const rawManifest = (data as { details: { fragments: unknown[]; dateRanges?: DateRangeMap } }).details
        if (rawManifest.dateRanges) {
          applyRegions(parseDateRanges(rawManifest.dateRanges))
          return
        }
        applyRegions(parseDateRangeTags(rawManifest.fragments as { tagList?: string[][] }[]))
      })
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src
    }
    return () => {
      hls?.destroy()
    }
  }, [src, sessionId, sessionError, assetId])

  // Picker-select handlers, factored: pull the numeric id, write to hls.js,
  // mirror to local state. Closes over hlsRef so the parent doesn't need it.
  const makeSelectHandler = (
    set: (v: number) => void,
    apply: (h: Hls, id: number) => void,
  ) => (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = parseInt(e.target.value, 10)
    if (hlsRef.current) apply(hlsRef.current, id)
    set(id)
  }
  const handleAudioChange = makeSelectHandler(setActiveAudio, (h, id) => { h.audioTrack = id })
  const handleSubtitleChange = makeSelectHandler(setActiveSubtitle, (h, id) => { h.subtitleTrack = id })
  const handleLevelChange = makeSelectHandler(setPinnedLevel, (h, id) => { h.currentLevel = id })

  // 8-second ABR slam: drop bandwidthEstimate + pin lowest tier, release after.
  // Mimics the user-facing UX of a real network drop without DevTools / SW throttling.
  const simulateSlowNetwork = () => {
    const h = hlsRef.current
    if (!h || levels.length === 0) return
    const DURATION_MS = 8000
    h.bandwidthEstimate = 200_000
    h.currentLevel = 0
    setPinnedLevel(0)
    setThrottleEndsAt(Date.now() + DURATION_MS)
    window.setTimeout(() => {
      if (hlsRef.current) { hlsRef.current.currentLevel = -1; setPinnedLevel(-1) }
      setThrottleEndsAt(null)
    }, DURATION_MS)
  }

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

  return {
    hlsRef,
    fragsLoadedRef,
    adRegions,
    adActiveSeed,
    audioTracks,
    activeAudio,
    subtitleTracks,
    activeSubtitle,
    levels,
    pinnedLevel,
    playingLevel,
    playerError,
    throttleEndsAt,
    handleAudioChange,
    handleSubtitleChange,
    handleLevelChange,
    simulateSlowNetwork,
    handleManualRetry,
  }
}
