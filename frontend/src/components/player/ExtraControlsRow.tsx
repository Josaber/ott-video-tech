/**
 * Row of small overlay buttons (PiP, AirPlay, slow-net simulation,
 * subtitle style toggle, stats toggle). Lives top-right of the video.
 */
export function ExtraControlsRow({
  pipSupported,
  pipActive,
  onTogglePip,
  airplayAvailable,
  onRequestAirplay,
  levelsCount,
  throttleEndsAt,
  onSimulateSlowNetwork,
  subtitleTracksCount,
  subStyleOpen,
  onToggleSubStyle,
  statsOpen,
  onToggleStats,
}: {
  pipSupported: boolean
  pipActive: boolean
  onTogglePip: () => void
  airplayAvailable: boolean
  onRequestAirplay: () => void
  levelsCount: number
  throttleEndsAt: number | null
  onSimulateSlowNetwork: () => void
  subtitleTracksCount: number
  subStyleOpen: boolean
  onToggleSubStyle: () => void
  statsOpen: boolean
  onToggleStats: () => void
}) {
  return (
    <div className="extra-controls">
      {pipSupported && (
        <button
          type="button"
          className="extra-btn"
          title={pipActive ? 'Exit picture-in-picture' : 'Picture-in-picture'}
          onClick={onTogglePip}
        >
          {pipActive ? '◱ exit pip' : '◰ pip'}
        </button>
      )}
      {airplayAvailable && (
        <button
          type="button"
          className="extra-btn"
          title="AirPlay"
          onClick={onRequestAirplay}
        >
          📡 airplay
        </button>
      )}
      {levelsCount > 1 && (
        <button
          type="button"
          className="extra-btn"
          title="Simulate slow network — pin ABR to lowest tier for 8 s"
          onClick={onSimulateSlowNetwork}
          disabled={throttleEndsAt !== null}
        >
          {throttleEndsAt !== null ? '🐌 throttling' : '🐌 slow net'}
        </button>
      )}
      {subtitleTracksCount > 0 && (
        <button
          type="button"
          className="extra-btn"
          title="Subtitle appearance"
          onClick={onToggleSubStyle}
        >
          {subStyleOpen ? '× cc' : '⚙ cc'}
        </button>
      )}
      <button
        type="button"
        className="extra-btn"
        title="Toggle playback stats"
        onClick={onToggleStats}
      >
        {statsOpen ? '× stats' : '📊 stats'}
      </button>
    </div>
  )
}
