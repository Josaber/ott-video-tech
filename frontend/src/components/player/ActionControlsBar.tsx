import { PLAYBACK_RATES } from './utils'

/**
 * Row of buttons immediately below the video element: ±10 s skip,
 * speed picker, share-at-t, restart, audio-sync toggle. Everything
 * except share-at-t and a/v sync is gated by `adActive` (defense in
 * depth on top of the parent's handler-level guards).
 */
export function ActionControlsBar({
  adActive,
  pinnedSpeed,
  onSpeedChange,
  onSkip,
  assetId,
  onShareAtTimestamp,
  onRestart,
  audioSyncOpen,
  onToggleAudioSync,
  audioSyncMs,
}: {
  adActive: boolean
  pinnedSpeed: number
  onSpeedChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  onSkip: (deltaSec: number) => void
  assetId?: string
  onShareAtTimestamp: () => void
  onRestart: () => void
  audioSyncOpen: boolean
  onToggleAudioSync: () => void
  audioSyncMs: number
}) {
  return (
    <div className={`action-controls-bar${adActive ? ' is-ad-locked' : ''}`}>
      <button
        type="button"
        className="extra-btn"
        title={adActive ? 'Disabled during ads' : 'Skip back 10 s'}
        onClick={() => onSkip(-10)}
        disabled={adActive}
      >⏪ 10s</button>
      <button
        type="button"
        className="extra-btn"
        title={adActive ? 'Disabled during ads' : 'Skip forward 10 s'}
        onClick={() => onSkip(10)}
        disabled={adActive}
      >10s ⏩</button>
      <label className="action-speed">
        speed
        <select
          value={pinnedSpeed}
          onChange={onSpeedChange}
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
          <button type="button" className="extra-btn" title="Copy share link at current time" onClick={onShareAtTimestamp}>🔗 share at t</button>
          <button
            type="button"
            className="extra-btn"
            title={adActive ? 'Disabled during ads' : 'Restart from beginning'}
            onClick={onRestart}
            disabled={adActive}
          >↺ restart</button>
        </>
      )}
      <button
        type="button"
        className="extra-btn"
        title="Audio / video sync offset"
        onClick={onToggleAudioSync}
      >
        {audioSyncOpen ? '× a/v sync' : '🎧 a/v sync'}
      </button>
      {audioSyncMs > 0 && (
        <span className="action-badge">audio +{audioSyncMs}ms</span>
      )}
    </div>
  )
}
