/**
 * Slider that delays audio playback by 0..500 ms via Web Audio's
 * DelayNode. Positive only — negative would need video delay too,
 * which the browser doesn't expose.
 */
export function AudioSyncPanel({
  open,
  audioSyncMs,
  onChange,
}: {
  open: boolean
  audioSyncMs: number
  onChange: (next: number) => void
}) {
  if (!open) return null
  return (
    <div className="audio-sync-panel-bar">
      <label>
        delay audio (ms)
        <input
          type="range" min={0} max={500} step={10}
          value={audioSyncMs}
          onChange={(e) => onChange(parseFloat(e.target.value))}
        />
        <span>{audioSyncMs} ms</span>
      </label>
      <p>Positive only — delays the audio via Web Audio DelayNode for users whose video lags audio.</p>
    </div>
  )
}
