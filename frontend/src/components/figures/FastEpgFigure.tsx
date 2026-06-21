// ---------------------------------------------------------------------------
// FAST channel EPG slice — portrait orientation: time runs top-to-bottom on
// the left axis, programs stack as horizontal blocks in a single column.
// SCTE-35 cue points sit as red markers on the *edge* of the schedule column
// so they never overlap the program-block title text.
// ---------------------------------------------------------------------------
export function FastEpgFigure() {
  const W = 560
  const H = 640

  // 18:00 → 23:00 (5 hours) maps to the schedule column.
  const startMin = 18 * 60
  const endMin = 23 * 60
  const totalMin = endMin - startMin

  const headerH = 96
  const padB = 100
  const colTop = headerH
  const colBottom = H - padB
  const colHeight = colBottom - colTop
  const yOf = (min: number) => colTop + ((min - startMin) / totalMin) * colHeight

  const colLeft = 100
  const colRight = W - 40
  const colW = colRight - colLeft

  const programs = [
    { title: 'Sitcom: "Apartment 5B"', start: 18 * 60, end: 18 * 60 + 30, color: '#22d3ee' },
    { title: 'Crime drama: "Cold Case"', start: 18 * 60 + 30, end: 19 * 60 + 30, color: '#8b5cf6' },
    { title: 'News bulletin', start: 19 * 60 + 30, end: 20 * 60, color: '#94a3b8' },
    { title: 'Feature film: "Northwind"', start: 20 * 60, end: 22 * 60, color: '#f59e0b' },
    { title: 'Late night: "After Hours"', start: 22 * 60, end: 23 * 60, color: '#f43f5e' },
  ]

  const adBreaks = [
    18 * 60 + 15,
    18 * 60 + 55,
    19 * 60 + 15,
    20 * 60 + 30,
    21 * 60,
    21 * 60 + 30,
    22 * 60 + 20,
  ]

  const fmt = (min: number) => `${Math.floor(min / 60)}:${String(min % 60).padStart(2, '0')}`

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      role="img"
      aria-label="FAST channel evening schedule with SCTE-35 ad markers (portrait)"
      style={{ display: 'block', maxWidth: '100%' }}
    >
      <rect x={0} y={0} width={W} height={H} fill="#0f172a" />

      {/* Header */}
      <text x={W / 2} y={26} textAnchor="middle" fontSize={12} fontWeight={700} fill="#f1f5f9" letterSpacing="0.06em">
        FAST CHANNEL EPG — Drama 24
      </text>
      <text x={W / 2} y={46} textAnchor="middle" fontSize={11} fill="#94a3b8">
        18:00 → 23:00 · time flows top-to-bottom · SCTE-35 markers = ad break cue points
      </text>

      {/* Header legend */}
      <g transform={`translate(${colLeft - 10} 64)`}>
        <polygon points="0,2 10,2 5,10" fill="#f43f5e" />
        <text x={18} y={11} fontSize={10.5} fill="#cbd5e1">
          SCTE-35 CUE-OUT
        </text>
        <rect x={150} y={1} width={14} height={12} fill="#22d3ee" fillOpacity={0.35} stroke="#22d3ee" />
        <text x={170} y={11} fontSize={10.5} fill="#cbd5e1">
          program block (no seeking)
        </text>
      </g>

      {/* Hour rule + tick marks on the left of the schedule column */}
      {[18, 19, 20, 21, 22, 23].map((h) => (
        <g key={`hr-${h}`}>
          <line
            x1={colLeft - 6}
            y1={yOf(h * 60)}
            x2={colRight}
            y2={yOf(h * 60)}
            stroke="#1e293b"
            strokeWidth={1}
          />
          <text
            x={colLeft - 14}
            y={yOf(h * 60) + 4}
            textAnchor="end"
            fontSize={12}
            fontWeight={600}
            fill="#cbd5e1"
          >
            {String(h).padStart(2, '0')}:00
          </text>
        </g>
      ))}

      {/* Program blocks — horizontal rectangles stacked vertically */}
      {programs.map((p, i) => {
        const y = yOf(p.start)
        const h = yOf(p.end) - y
        return (
          <g key={`prog-${i}`}>
            <rect
              x={colLeft}
              y={y}
              width={colW}
              height={h}
              rx={6}
              fill={p.color}
              fillOpacity={0.28}
              stroke={p.color}
              strokeWidth={1.4}
            />
            <text x={colLeft + 12} y={y + 22} fontSize={12.5} fontWeight={700} fill="#f1f5f9">
              {p.title}
            </text>
            {h >= 38 && (
              <text x={colLeft + 12} y={y + 38} fontSize={10.5} fill="#cbd5e1">
                {fmt(p.start)} - {fmt(p.end)}
              </text>
            )}
          </g>
        )
      })}

      {/* SCTE-35 markers on the right edge of the schedule column. Triangle
          sits OUTSIDE the column pointing left; a short tick reaches into the
          column. The time label is right-anchored INSIDE the column on the
          opposite side from the title text so they never collide. */}
      {adBreaks.map((m, i) => {
        const my = yOf(m)
        return (
          <g key={`ad-${i}`}>
            <polygon
              points={`${colRight + 14},${my - 6} ${colRight + 14},${my + 6} ${colRight + 4},${my}`}
              fill="#f43f5e"
            />
            <line
              x1={colRight + 4}
              y1={my}
              x2={colRight - 60}
              y2={my}
              stroke="#f43f5e"
              strokeWidth={1.5}
              strokeDasharray="3 3"
            />
            <text
              x={colRight - 8}
              y={my - 4}
              textAnchor="end"
              fontSize={10}
              fill="#f43f5e"
              fontWeight={700}
            >
              {fmt(m)}
            </text>
          </g>
        )
      })}

      {/* Footer */}
      <text x={W / 2} y={H - 56} textAnchor="middle" fontSize={11} fill="#94a3b8">
        Player tunes in to a sliding-window live manifest (DVR optional).
      </text>
      <text x={W / 2} y={H - 36} textAnchor="middle" fontSize={11} fill="#94a3b8">
        SSAI replaces filler at every SCTE-35 cue with a fresh ad pod.
      </text>
    </svg>
  )
}
