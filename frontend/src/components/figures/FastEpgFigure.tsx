// ---------------------------------------------------------------------------
// FAST channel EPG slice — a linear schedule strip with SCTE-35 ad markers
// drawn as vertical bands inside each program block.
// ---------------------------------------------------------------------------
export function FastEpgFigure() {
  const W = 720
  const H = 280
  const padL = 56
  const padR = 24
  const trackTop = 80
  const trackH = 60
  const innerW = W - padL - padR

  // 6 PM to 11 PM (5 hours)
  const startMin = 18 * 60
  const endMin = 23 * 60
  const totalMin = endMin - startMin
  const xOf = (min: number) => padL + ((min - startMin) / totalMin) * innerW

  const programs = [
    { title: 'Sitcom: "Apartment 5B"', start: 18 * 60, end: 18 * 60 + 30, color: '#22d3ee' },
    { title: 'Crime drama: "Cold Case"', start: 18 * 60 + 30, end: 19 * 60 + 30, color: '#8b5cf6' },
    { title: 'News bulletin', start: 19 * 60 + 30, end: 20 * 60, color: '#94a3b8' },
    { title: 'Feature film: "Northwind"', start: 20 * 60, end: 22 * 60, color: '#f59e0b' },
    { title: 'Late night: "After Hours"', start: 22 * 60, end: 23 * 60, color: '#f43f5e' },
  ]
  // SCTE-35 ad breaks — vertical markers
  const adBreaks = [
    18 * 60 + 15,
    18 * 60 + 55,
    19 * 60 + 15,
    20 * 60 + 30,
    21 * 60,
    21 * 60 + 30,
    22 * 60 + 20,
  ]

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      role="img"
      aria-label="FAST channel evening schedule with SCTE-35 ad markers"
      style={{ display: 'block', maxWidth: '100%' }}
    >
      <rect x={0} y={0} width={W} height={H} fill="#0f172a" />
      <text x={W / 2} y={24} textAnchor="middle" fontSize={11} fill="#94a3b8" letterSpacing="0.08em">
        FAST CHANNEL EPG · 18:00 → 23:00 · SCTE-35 MARKERS = AD BREAK CUE-OUT POINTS
      </text>
      <text x={padL} y={48} fontSize={11} fill="#cbd5e1">
        Channel: Drama 24
      </text>

      {/* Time ruler */}
      {[18, 19, 20, 21, 22, 23].map((h) => (
        <g key={h}>
          <line x1={xOf(h * 60)} y1={trackTop - 12} x2={xOf(h * 60)} y2={trackTop + trackH + 8} stroke="#1e293b" strokeWidth={1} />
          <text x={xOf(h * 60)} y={trackTop - 18} textAnchor="middle" fontSize={10} fill="#94a3b8">
            {String(h).padStart(2, '0')}:00
          </text>
        </g>
      ))}

      {programs.map((p, i) => {
        const x = xOf(p.start)
        const w = xOf(p.end) - x
        return (
          <g key={i}>
            <rect x={x} y={trackTop} width={w} height={trackH} rx={4} fill={p.color} fillOpacity={0.32} stroke={p.color} />
            <text x={x + 8} y={trackTop + 22} fontSize={10.5} fontWeight={700} fill="#f1f5f9">
              {p.title}
            </text>
            <text x={x + 8} y={trackTop + 38} fontSize={9.5} fill="#cbd5e1">
              {Math.floor(p.start / 60)}:{String(p.start % 60).padStart(2, '0')} - {Math.floor(p.end / 60)}:{String(p.end % 60).padStart(2, '0')}
            </text>
          </g>
        )
      })}

      {/* SCTE-35 markers — small inverted triangle above the track (cue point)
          and a tiny tick + dot below, so the program block text stays readable. */}
      {adBreaks.map((m, i) => {
        const mx = xOf(m)
        return (
          <g key={`ad-${i}`}>
            {/* tick just above track */}
            <line x1={mx} y1={trackTop - 8} x2={mx} y2={trackTop - 2} stroke="#f43f5e" strokeWidth={2} />
            {/* downward triangle pointing at the cue point */}
            <polygon
              points={`${mx - 5},${trackTop - 16} ${mx + 5},${trackTop - 16} ${mx},${trackTop - 8}`}
              fill="#f43f5e"
            />
            {/* dot below the track */}
            <circle cx={mx} cy={trackTop + trackH + 10} r={3.5} fill="#f43f5e" />
            <line x1={mx} y1={trackTop + trackH + 2} x2={mx} y2={trackTop + trackH + 6} stroke="#f43f5e" strokeWidth={1.5} />
          </g>
        )
      })}

      <g transform={`translate(${padL} ${trackTop + trackH + 40})`}>
        <polygon points="0,0 10,0 5,8" fill="#f43f5e" />
        <text x={18} y={8} fontSize={10} fill="#cbd5e1">
          SCTE-35 CUE-OUT (ad break opportunity)
        </text>
        <rect x={240} y={-2} width={14} height={12} fill="#22d3ee" fillOpacity={0.35} stroke="#22d3ee" />
        <text x={260} y={8} fontSize={10} fill="#cbd5e1">
          program block (linear, no seeking)
        </text>
      </g>
      <text x={padL} y={H - 16} fontSize={10} fill="#94a3b8">
        Player tunes in, manifest is sliding-window live (DVR optional); SSAI swaps fills at each marker.
      </text>
    </svg>
  )
}
