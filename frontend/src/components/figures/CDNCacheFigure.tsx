import { ArrowMarker } from './_shared'

// ---------------------------------------------------------------------------
// CDN — origin → shield → regional → edge → viewers
// ---------------------------------------------------------------------------
export function CDNCacheFigure() {
  return (
    <svg
      viewBox="0 0 720 360"
      width="100%"
      role="img"
      aria-label="CDN cache hierarchy"
      style={{ display: 'block', maxWidth: '100%' }}
    >
      <defs>
        <ArrowMarker id="cdn-arrow" />
      </defs>

      {/* Origin */}
      <rect x={280} y={14} width={160} height={42} rx={6} fill="#1e293b" stroke="#22d3ee" strokeWidth={1.5} />
      <text x={360} y={32} textAnchor="middle" fontSize={11} fontWeight={700} fill="#22d3ee" letterSpacing="0.08em">
        ORIGIN
      </text>
      <text x={360} y={48} textAnchor="middle" fontSize={10} fill="#94a3b8">
        your backend / packager
      </text>
      <line x1={360} y1={56} x2={360} y2={78} stroke="#475569" strokeWidth={1.5} markerEnd="url(#cdn-arrow)" />

      {/* Origin shield */}
      <rect x={264} y={80} width={192} height={42} rx={6} fill="#1e293b" stroke="#334155" />
      <text x={360} y={98} textAnchor="middle" fontSize={11} fontWeight={700} fill="#e2e8f0" letterSpacing="0.06em">
        ORIGIN SHIELD
      </text>
      <text x={360} y={114} textAnchor="middle" fontSize={10} fill="#94a3b8">
        single PoP, collapses concurrent misses
      </text>

      {/* Branches to tier-2 */}
      {[180, 360, 540].map((cx) => (
        <line
          key={cx}
          x1={360}
          y1={122}
          x2={cx}
          y2={144}
          stroke="#475569"
          strokeWidth={1.5}
          markerEnd="url(#cdn-arrow)"
        />
      ))}

      {/* Tier 2 — regional PoPs */}
      {[
        { x: 100, label: 'TIER-2 NA' },
        { x: 280, label: 'TIER-2 EU' },
        { x: 460, label: 'TIER-2 APAC' },
      ].map(({ x, label }) => (
        <g key={label}>
          <rect x={x} y={146} width={160} height={36} rx={6} fill="#1e293b" stroke="#334155" />
          <text x={x + 80} y={162} textAnchor="middle" fontSize={10.5} fontWeight={700} fill="#cbd5e1" letterSpacing="0.06em">
            {label}
          </text>
          <text x={x + 80} y={175} textAnchor="middle" fontSize={9.5} fill="#94a3b8">
            regional mid-tier cache
          </text>
        </g>
      ))}

      {/* Branches to edges (depict three under each tier-2; reuse a small set per column) */}
      {[180, 360, 540].map((cx) =>
        [-44, 0, 44].map((dx, j) => (
          <line
            key={`${cx}-${j}`}
            x1={cx}
            y1={182}
            x2={cx + dx}
            y2={210}
            stroke="#475569"
            strokeWidth={1.2}
            markerEnd="url(#cdn-arrow)"
          />
        )),
      )}

      {/* Edges */}
      {[180, 360, 540].map((cx) =>
        [-44, 0, 44].map((dx, j) => (
          <g key={`edge-${cx}-${j}`}>
            <rect
              x={cx + dx - 30}
              y={212}
              width={60}
              height={28}
              rx={4}
              fill="#1e293b"
              stroke="#334155"
            />
            <text x={cx + dx} y={224} textAnchor="middle" fontSize={9} fontWeight={700} fill="#94a3b8" letterSpacing="0.06em">
              EDGE
            </text>
            <text x={cx + dx} y={234} textAnchor="middle" fontSize={9} fill="#64748b">
              PoP
            </text>
          </g>
        )),
      )}

      {/* Branches to viewers */}
      {[180, 360, 540].map((cx) =>
        [-44, 0, 44].map((dx, j) => (
          <line
            key={`vline-${cx}-${j}`}
            x1={cx + dx}
            y1={240}
            x2={cx + dx}
            y2={270}
            stroke="#475569"
            strokeWidth={1.2}
            markerEnd="url(#cdn-arrow)"
          />
        )),
      )}

      {/* Viewer icons */}
      {[180, 360, 540].map((cx) =>
        [-44, 0, 44].map((dx, j) => (
          <g key={`viewer-${cx}-${j}`}>
            <circle cx={cx + dx} cy={282} r={6} fill="#0f172a" stroke="#f59e0b" strokeWidth={1.5} />
          </g>
        )),
      )}

      {/* Viewer band */}
      <rect x={40} y={300} width={640} height={42} rx={4} fill="#0f172a" stroke="#334155" />
      <text x={360} y={318} textAnchor="middle" fontSize={10.5} fontWeight={700} fill="#f59e0b" letterSpacing="0.08em">
        VIEWERS
      </text>
      <text x={360} y={334} textAnchor="middle" fontSize={10} fill="#94a3b8">
        cache hit at any tier short-circuits the path; only misses climb back up
      </text>
    </svg>
  )
}
