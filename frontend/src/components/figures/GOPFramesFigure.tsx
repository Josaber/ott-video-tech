import { ArrowMarker } from './_shared'

// ---------------------------------------------------------------------------
// GOP / I-P-B frame pattern
// ---------------------------------------------------------------------------
export function GOPFramesFigure() {
  // Pattern: I B B P B B P B B P B B  | I B B P
  // Two GOPs of 12 frames + 4 frames of GOP 3 = 16 frames shown.
  const pattern = ['I', 'B', 'B', 'P', 'B', 'B', 'P', 'B', 'B', 'P', 'B', 'B',
                   'I', 'B', 'B', 'P']
  const fw = 38
  const fg = 4
  const xStart = 40
  const yFrames = 60

  const color = (t: string) => {
    if (t === 'I') return { fill: '#22d3ee', text: '#0f172a', stroke: '#22d3ee' }
    if (t === 'P') return { fill: '#1d4ed8', text: '#f1f5f9', stroke: '#3b82f6' }
    return { fill: '#1e293b', text: '#94a3b8', stroke: '#334155' }
  }

  return (
    <svg
      viewBox="0 0 720 248"
      width="100%"
      role="img"
      aria-label="I, P and B frames within a GOP"
      style={{ display: 'block', maxWidth: '100%' }}
    >
      <defs>
        <ArrowMarker id="gop-arrow" />
      </defs>

      {/* Time axis */}
      <text x={40} y={28} fontSize={10} fill="#64748b" letterSpacing="0.1em">TIME →</text>
      <line x1={88} y1={24} x2={680} y2={24} stroke="#334155" strokeDasharray="2 3" />

      {/* Frames */}
      {pattern.map((t, i) => {
        const x = xStart + i * (fw + fg)
        const c = color(t)
        return (
          <g key={i}>
            <rect x={x} y={yFrames} width={fw} height={48} rx={4} fill={c.fill} stroke={c.stroke} />
            <text x={x + fw / 2} y={yFrames + 30} textAnchor="middle" fontSize={15} fontWeight={700} fill={c.text}>
              {t}
            </text>
            <text x={x + fw / 2} y={yFrames + 60} textAnchor="middle" fontSize={9} fill="#64748b">
              {i}
            </text>
          </g>
        )
      })}

      {/* GOP 1 bracket */}
      {(() => {
        const x1 = xStart
        const x2 = xStart + 12 * (fw + fg) - fg
        const by = yFrames + 78
        return (
          <g>
            <line x1={x1} y1={by} x2={x2} y2={by} stroke="#22d3ee" strokeWidth={1.5} />
            <line x1={x1} y1={by} x2={x1} y2={by - 6} stroke="#22d3ee" strokeWidth={1.5} />
            <line x1={x2} y1={by} x2={x2} y2={by - 6} stroke="#22d3ee" strokeWidth={1.5} />
            <text x={(x1 + x2) / 2} y={by + 16} textAnchor="middle" fontSize={11} fontWeight={700} fill="#22d3ee">
              GOP 1 · 12 frames · ~2–4 s
            </text>
          </g>
        )
      })()}

      {/* GOP 2 bracket (partial) */}
      {(() => {
        const x1 = xStart + 12 * (fw + fg)
        const x2 = xStart + 16 * (fw + fg) - fg
        const by = yFrames + 78
        return (
          <g>
            <line x1={x1} y1={by} x2={x2} y2={by} stroke="#94a3b8" strokeWidth={1.5} />
            <line x1={x1} y1={by} x2={x1} y2={by - 6} stroke="#94a3b8" strokeWidth={1.5} />
            <line x1={x2} y1={by} x2={x2} y2={by - 6} stroke="#94a3b8" strokeWidth={1.5} />
            <text x={(x1 + x2) / 2} y={by + 16} textAnchor="middle" fontSize={11} fontWeight={700} fill="#94a3b8">
              GOP 2 →
            </text>
          </g>
        )
      })()}

      {/* Callout: I-frame = segment boundary */}
      <g>
        <line
          x1={xStart + fw / 2}
          y1={yFrames - 6}
          x2={xStart + fw / 2}
          y2={yFrames - 24}
          stroke="#22d3ee"
          strokeWidth={1.5}
          markerStart="url(#gop-arrow)"
        />
        <text x={xStart + fw / 2 + 16} y={yFrames - 14} fontSize={10} fill="#22d3ee">
          I-frame = HLS segment boundary candidate
        </text>
      </g>

      {/* Legend */}
      <g transform="translate(40, 200)">
        <rect x={0} y={0} width={16} height={14} rx={3} fill="#22d3ee" />
        <text x={22} y={11} fontSize={10.5} fill="#cbd5e1">
          <tspan fontWeight={700}>I</tspan> · intra-coded, standalone
        </text>
        <rect x={196} y={0} width={16} height={14} rx={3} fill="#1d4ed8" />
        <text x={218} y={11} fontSize={10.5} fill="#cbd5e1">
          <tspan fontWeight={700}>P</tspan> · predicted from prior I/P
        </text>
        <rect x={416} y={0} width={16} height={14} rx={3} fill="#1e293b" stroke="#334155" />
        <text x={438} y={11} fontSize={10.5} fill="#cbd5e1">
          <tspan fontWeight={700}>B</tspan> · bidirectional, predicted from both sides
        </text>
      </g>
    </svg>
  )
}
