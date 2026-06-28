/**
 * Renders when the user has hit the concurrent-stream limit (backend
 * returns 429 on /api/me/playback-session). The HlsPlayer skips
 * rendering the video element entirely in this case.
 */
export function StreamLimitOverlay({ limit }: { limit: number }) {
  return (
    <div className="stream-limit">
      <strong>Max streams reached.</strong>
      <div>
        This account is already watching on {limit} other device{limit === 1 ? '' : 's'}.
        Stop one of them to start another stream.
      </div>
    </div>
  )
}
