import { ArrowMarker } from './_shared'

// ---------------------------------------------------------------------------
// Search & discovery — query pipeline
// ---------------------------------------------------------------------------
export function SearchPipelineFigure() {
  const stages = [
    { label: 'INPUT',       note: 'typed / voice' },
    { label: 'AUTOCOMPLETE', note: 'n-gram suggester' },
    { label: 'RETRIEVAL',   note: 'ES / Algolia' },
    { label: 'RERANK',      note: 'ML scoring' },
    { label: 'DIVERSIFY',   note: 'MMR / dedup' },
    { label: 'RENDER',      note: 'rail / grid' },
  ]
  const boxW = 96
  const gap = 12
  const total = stages.length * boxW + (stages.length - 1) * gap
  const xStart = (720 - total) / 2

  return (
    <svg
      viewBox="0 0 720 240"
      width="100%"
      role="img"
      aria-label="Search pipeline"
      style={{ display: 'block', maxWidth: '100%' }}
    >
      <defs>
        <ArrowMarker id="search-arrow" />
      </defs>

      {/* Stage boxes */}
      {stages.map((s, i) => {
        const x = xStart + i * (boxW + gap)
        const isFirst = i === 0
        const isLast = i === stages.length - 1
        const accent = isFirst ? '#22d3ee' : isLast ? '#10b981' : '#334155'
        return (
          <g key={s.label}>
            <rect x={x} y={70} width={boxW} height={84} rx={6} fill="#1e293b" stroke={accent} />
            <text x={x + boxW / 2} y={94} textAnchor="middle" fontSize={11} fontWeight={700} fill="#22d3ee" letterSpacing="0.06em">
              {s.label}
            </text>
            <text x={x + boxW / 2} y={112} textAnchor="middle" fontSize={10} fill="#94a3b8">
              {s.note}
            </text>
            {/* Step number */}
            <text x={x + boxW / 2} y={140} textAnchor="middle" fontSize={11} fontWeight={700} fill="#64748b" fontFamily="ui-monospace, monospace">
              {String(i + 1).padStart(2, '0')}
            </text>
          </g>
        )
      })}

      {/* Arrows between stages */}
      {stages.slice(0, -1).map((_, i) => {
        const fromX = xStart + i * (boxW + gap) + boxW
        const toX = xStart + (i + 1) * (boxW + gap)
        return (
          <line
            key={i}
            x1={fromX + 2}
            y1={112}
            x2={toX - 2}
            y2={112}
            stroke="#475569"
            strokeWidth={1.5}
            markerEnd="url(#search-arrow)"
          />
        )
      })}

      {/* Ranking-signals strip */}
      <rect x={xStart} y={176} width={total} height={42} rx={4} fill="#0f172a" stroke="#334155" />
      <text x={360} y={194} textAnchor="middle" fontSize={10.5} fontWeight={700} fill="#94a3b8" letterSpacing="0.08em">
        RANKING SIGNALS
      </text>
      <text x={360} y={210} textAnchor="middle" fontSize={10} fill="#cbd5e1">
        text match · popularity · recency · personalisation · regional availability · rights
      </text>

      {/* Top label */}
      <text x={360} y={36} textAnchor="middle" fontSize={10} fill="#64748b" letterSpacing="0.12em">
        QUERY · ~100 ms BUDGET
      </text>
    </svg>
  )
}
