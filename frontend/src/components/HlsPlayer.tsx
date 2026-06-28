import { useRef, useState } from 'react'
import { api } from '../api/client'
import { useToast } from './Toast'

import { PREROLL_OFFSET_SEC } from './player/utils'
import { ActionControlsBar } from './player/ActionControlsBar'
import { AudioSyncPanel } from './player/AudioSyncPanel'
import { BitrateOverlay } from './player/BitrateOverlay'
import { ExtraControlsRow } from './player/ExtraControlsRow'
import { PlayerErrorOverlay } from './player/PlayerErrorOverlay'
import { StatsOverlay } from './player/StatsOverlay'
import { StreamLimitOverlay } from './player/StreamLimitOverlay'
import { SubtitleStyleMenu } from './player/SubtitleStyleMenu'
import { TrackPicker } from './player/TrackPicker'
import { TrickPlayStrip } from './player/TrickPlayStrip'
import { UpNextOverlay, UpNextProps } from './player/UpNextOverlay'

import { useAdGuard } from './player/hooks/useAdGuard'
import { useAirplay } from './player/hooks/useAirplay'
import { useAudioSyncDelay } from './player/hooks/useAudioSyncDelay'
import { useDurationCurrentTime } from './player/hooks/useDurationCurrentTime'
import { useHlsLifecycle } from './player/hooks/useHlsLifecycle'
import { useInitialSeek } from './player/hooks/useInitialSeek'
import {
  useAudioSyncMs,
  useSubtitleStyle,
  useVolumeMemory,
} from './player/hooks/usePersistedSettings'
import { usePictureInPicture } from './player/hooks/usePictureInPicture'
import { usePinnedSpeed } from './player/hooks/usePinnedSpeed'
import { usePlaybackSession } from './player/hooks/usePlaybackSession'
import { useSessionHeartbeat } from './player/hooks/useSessionHeartbeat'
import { useStatsOverlay } from './player/hooks/useStatsOverlay'
import { useThumbnailCues } from './player/hooks/useThumbnailCues'
import { useUpNextCountdown } from './player/hooks/useUpNextCountdown'
import { useWatchProgress } from './player/hooks/useWatchProgress'
import { fmt } from './player/utils'

interface Props {
  src: string
  assetId?: string
  thumbnailsUrl?: string | null
  /** Optional initial seek position in seconds (program time). */
  initialSeekSeconds?: number
  /** Optional Up Next teaser shown in the last 15 s of the video. */
  upNext?: UpNextProps | null
}

/**
 * HLS video player with:
 *   - ad-not-skippable enforcement reading EXT-X-DATERANGE
 *   - trick-play scrub bar with sprite thumbnails
 *   - share-at-timestamp, restart-from-start, audio sync, subtitle styling
 *   - quality / audio / subtitle pickers
 *   - playback session enforcement + heartbeat
 *   - watch progress persistence (resume + autosave)
 *   - up next teaser with auto-roll countdown
 *
 * The implementation is split across `player/` — this file is the
 * orchestrator: wire hooks together, build the JSX from sub-components.
 * Behavioral logic lives in the hooks; presentation in the components.
 */
export function HlsPlayer({ src, assetId, thumbnailsUrl, initialSeekSeconds, upNext }: Props) {
  const toast = useToast()
  const videoRef = useRef<HTMLVideoElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  // Furthest the user has actually played to. Several hooks read & write
  // this — resume seeds it, initial seek bumps it, ad guard updates it
  // on every timeupdate.
  const maxWatched = useRef<number>(0)

  // --- Persisted user preferences ---
  const [subStyle, setSubStyle] = useSubtitleStyle()
  const [audioSyncMs, setAudioSyncMs] = useAudioSyncMs()
  useVolumeMemory(videoRef, src)

  // --- Playback session + heartbeat ---
  const { sessionId, sessionError } = usePlaybackSession(assetId)
  useSessionHeartbeat(sessionId)

  // --- HLS instance + tracks + ad regions + level state ---
  const { duration, currentTime } = useDurationCurrentTime(videoRef)
  const hls = useHlsLifecycle({
    videoRef, src, assetId, sessionId, sessionError, maxWatchedRef: maxWatched,
  })

  // --- Ad guard + speed pin (depend on ad regions) ---
  const [adActive, setAdActive] = useAdGuard(videoRef, hls.adRegions, maxWatched, hls.adActiveSeed)
  const [pinnedSpeed, setPinnedSpeed] = usePinnedSpeed(videoRef, adActive)

  // --- Trick-play + watch progress + initial seek + up next ---
  const { cues, spriteUrl } = useThumbnailCues(thumbnailsUrl)
  const { resumedFrom } = useWatchProgress(videoRef, maxWatched, assetId, src)
  useInitialSeek(videoRef, maxWatched, src, initialSeekSeconds)
  const upNextState = useUpNextCountdown(videoRef, src, upNext)

  // --- Audio sync + AirPlay + PiP ---
  useAudioSyncDelay(videoRef, audioSyncMs, src)
  const { airplayAvailable, requestAirplay } = useAirplay(videoRef)
  const { pipActive, pipSupported, togglePip } = usePictureInPicture(videoRef, wrapRef, hls.hlsRef)

  // --- Overlay open/close toggles ---
  const [statsOpen, setStatsOpen] = useState<boolean>(false)
  const [subStyleOpen, setSubStyleOpen] = useState<boolean>(false)
  const [audioSyncOpen, setAudioSyncOpen] = useState<boolean>(false)
  const stats = useStatsOverlay(videoRef, hls.hlsRef, hls.fragsLoadedRef, statsOpen)
  // setAdActive is exposed by useAdGuard but currently unused outside;
  // void it so the linter doesn't flag the destructure.
  void setAdActive

  // --- Handlers (small, kept inline because they touch local state) ---
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
    const programT = Math.max(0, video.currentTime - PREROLL_OFFSET_SEC)
    const url = `${window.location.origin}/#/asset?asset=${assetId}&t=${programT.toFixed(1)}`
    try {
      await navigator.clipboard.writeText(url)
      toast.push('success', 'Share link copied to clipboard')
    } catch {
      toast.push('error', 'Could not copy to clipboard')
    }
  }

  if (sessionError) return <StreamLimitOverlay limit={sessionError.limit} />

  return (
    <>
      <TrackPicker
        levels={hls.levels}
        pinnedLevel={hls.pinnedLevel}
        onLevelChange={hls.handleLevelChange}
        audioTracks={hls.audioTracks}
        activeAudio={hls.activeAudio}
        onAudioChange={hls.handleAudioChange}
        subtitleTracks={hls.subtitleTracks}
        activeSubtitle={hls.activeSubtitle}
        onSubtitleChange={hls.handleSubtitleChange}
      />
      <div className="video-wrap" ref={wrapRef}>
        <PlayerErrorOverlay error={hls.playerError} onRetry={hls.handleManualRetry} />
        {adActive && <div className="ad-overlay">AD · NOT SKIPPABLE</div>}
        {resumedFrom != null && (
          <div className="resume-overlay">resumed at {fmt(resumedFrom)}</div>
        )}
        <BitrateOverlay
          levels={hls.levels}
          pinnedLevel={hls.pinnedLevel}
          playingLevel={hls.playingLevel}
        />
        <ExtraControlsRow
          pipSupported={pipSupported}
          pipActive={pipActive}
          onTogglePip={togglePip}
          airplayAvailable={airplayAvailable}
          onRequestAirplay={requestAirplay}
          levelsCount={hls.levels.length}
          throttleEndsAt={hls.throttleEndsAt}
          onSimulateSlowNetwork={hls.simulateSlowNetwork}
          subtitleTracksCount={hls.subtitleTracks.length}
          subStyleOpen={subStyleOpen}
          onToggleSubStyle={() => { setSubStyleOpen((v) => !v); setStatsOpen(false) }}
          statsOpen={statsOpen}
          onToggleStats={() => { setStatsOpen((v) => !v); setSubStyleOpen(false) }}
        />
        <SubtitleStyleMenu open={subStyleOpen} style={subStyle} onChange={setSubStyle} />
        {statsOpen && <StatsOverlay stats={stats} levels={hls.levels} />}
        <video ref={videoRef} controls playsInline />
        {upNextState.active && upNext && (
          <UpNextOverlay
            upNext={upNext}
            countdown={upNextState.countdown}
            onPlay={upNextState.playNow}
            onCancel={upNextState.dismiss}
          />
        )}
      </div>
      <ActionControlsBar
        adActive={adActive}
        pinnedSpeed={pinnedSpeed}
        onSpeedChange={handleSpeedChange}
        onSkip={skip}
        assetId={assetId}
        onShareAtTimestamp={shareAtTimestamp}
        onRestart={restartFromStart}
        audioSyncOpen={audioSyncOpen}
        onToggleAudioSync={() => setAudioSyncOpen((v) => !v)}
        audioSyncMs={audioSyncMs}
      />
      <AudioSyncPanel open={audioSyncOpen} audioSyncMs={audioSyncMs} onChange={setAudioSyncMs} />
      <TrickPlayStrip
        cues={cues}
        spriteUrl={spriteUrl}
        currentTime={currentTime}
        duration={duration}
        onSeek={(t) => { const v = videoRef.current; if (v) v.currentTime = t }}
      />
    </>
  )
}
