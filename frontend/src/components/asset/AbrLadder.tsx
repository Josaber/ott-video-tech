import { Rendition } from '../../api/client'

/**
 * Read-only table of the asset's ABR (adaptive bitrate) rendition
 * ladder. Each row corresponds to one variant the transcode produced.
 * The PTE-hull "optimal" flag indicates the variant landed on the
 * per-title-encoding convex hull — i.e. no other variant Pareto-dominates
 * it on (VMAF, bitrate). See Docs for the full background.
 */
export function AbrLadder({ renditions }: { renditions: Rendition[] }) {
  if (renditions.length === 0) return null
  return (
    <div className="panel">
      <h1>ABR ladder</h1>
      <div className="ladder-table">
        <div className="ladder-row ladder-head">
          <span>tier</span>
          <span>resolution</span>
          <span>video bitrate</span>
          <span>audio bitrate</span>
          <span>VMAF</span>
          <span>PTE hull</span>
        </div>
        {renditions.map((r) => (
          <div className="ladder-row" key={r.tier}>
            <span className="tier">{r.tier}</span>
            <span>{r.width}×{r.height}</span>
            <span>{r.videoBitrateKbps} kbps</span>
            <span>{r.audioBitrateKbps} kbps</span>
            <span>{r.vmafScore != null ? r.vmafScore.toFixed(2) : '—'}</span>
            <span>
              {r.convexHullOptimal == null ? '—'
                : r.convexHullOptimal
                  ? <span className="hull-flag hull-optimal">optimal</span>
                  : <span className="hull-flag hull-dominated">dominated</span>}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
