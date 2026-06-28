/**
 * Two-mode overlay shown over the video element when hls.js reports
 * trouble. Transient = "we're retrying"; fatal = "give up, manual retry".
 */
export interface PlayerErrorState {
  kind: string
  details: string
  fatal: boolean
  retryAttempt: number
}

export function PlayerErrorOverlay({
  error,
  onRetry,
}: {
  error: PlayerErrorState | null
  onRetry: () => void
}) {
  if (!error) return null
  if (error.fatal) {
    return (
      <div className="player-error-fatal">
        <strong>Playback failed</strong>
        <div className="player-error-detail">
          {error.kind} · {error.details}
        </div>
        <button onClick={onRetry}>Try again</button>
      </div>
    )
  }
  return (
    <div className="player-error-transient">
      {error.kind === 'network' ? 'Network glitch' : 'Decoder hiccup'}
      <span> · retrying ({error.retryAttempt}/{error.kind === 'network' ? 3 : 1})</span>
    </div>
  )
}
