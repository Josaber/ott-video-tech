export interface PlayerStats {
  bandwidthKbps: number
  currentLevel: number
  fragsLoaded: number
  droppedFrames: number
  decodedFrames: number
  bufferAheadSec: number
  latencySec: number | null
}

/**
 * Bottom-left dev panel showing live hls.js metrics. Hidden until the
 * user toggles it on via the 📊 stats button.
 */
export function StatsOverlay({
  stats,
  levels,
}: {
  stats: PlayerStats | null
  levels: { id: number; label: string }[]
}) {
  if (!stats) return null
  return (
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
  )
}
