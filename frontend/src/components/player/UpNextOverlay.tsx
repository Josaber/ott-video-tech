export interface UpNextProps {
  title: string
  /** Optional eyebrow like "Foo · S2 E5" rendered above the title. */
  subtitle?: string | null
  posterUrl?: string | null
  onPlay: () => void
}

/**
 * Bottom-right card that appears in the last 15 s of program time with a
 * 10-second countdown auto-roll. Caller owns the countdown state — this
 * component is pure presentation.
 */
export function UpNextOverlay({
  upNext,
  countdown,
  onPlay,
  onCancel,
}: {
  upNext: UpNextProps
  countdown: number
  onPlay: () => void
  onCancel: () => void
}) {
  return (
    <div className="upnext-overlay">
      {upNext.posterUrl && (
        <img className="upnext-poster" src={upNext.posterUrl} alt="" />
      )}
      <div className="upnext-text">
        <div className="upnext-eyebrow">Up next in {countdown}s</div>
        {upNext.subtitle && (
          <div className="upnext-subtitle">{upNext.subtitle}</div>
        )}
        <div className="upnext-title">{upNext.title}</div>
        <div className="upnext-actions">
          <button type="button" onClick={onPlay}>
            Play now
          </button>
          <button type="button" className="secondary" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
