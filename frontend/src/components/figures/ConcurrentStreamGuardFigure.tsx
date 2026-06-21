// ---------------------------------------------------------------------------
// Concurrent-stream guard — decision flow from incoming play request to
// allow/deny through three checks: device known, concurrent count, geo.
// ---------------------------------------------------------------------------
export function ConcurrentStreamGuardFigure() {
  const W = 720
  const H = 420

  // Vertical layout: title → entry → 3 decisions → allow.
  // Heights are computed so adjacent rectangles never overlap.
  const decideH = 40
  const entryH = 40
  const allowH = 40
  const gap = 22

  const titleY = 24
  const entryTop = 46
  const decideTop = (i: number) => entryTop + entryH + gap + i * (decideH + gap)
  const allowTop = decideTop(2) + decideH + gap
  const cx = W / 2

  const decideW = 360
  const decideLeft = cx - decideW / 2
  const decideRight = cx + decideW / 2

  const decisions = [
    { label: 'device fingerprint known?', fail: 'unknown device → deny', color: '#10b981', failColor: '#f43f5e' },
    { label: 'live streams < household cap (e.g. 4)?', fail: 'cap exceeded → deny', color: '#f59e0b', failColor: '#f43f5e' },
    { label: 'geo within household region?', fail: 'drift → step-up auth', color: '#22d3ee', failColor: '#fbbf24' },
  ]

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      role="img"
      aria-label="Concurrent-stream policy guard decision flow"
      style={{ display: 'block', maxWidth: '100%' }}
    >
      <defs>
        <marker id="arrGuard" viewBox="0 0 10 10" refX={9} refY={5} markerWidth={8} markerHeight={8} orient="auto">
          <path d="M0,0 L10,5 L0,10 z" fill="#cbd5e1" />
        </marker>
        <marker id="arrGuardAllow" viewBox="0 0 10 10" refX={9} refY={5} markerWidth={9} markerHeight={9} orient="auto">
          <path d="M0,0 L10,5 L0,10 z" fill="#10b981" />
        </marker>
      </defs>

      <rect x={0} y={0} width={W} height={H} fill="#0f172a" />
      <text x={cx} y={titleY} textAnchor="middle" fontSize={11} fill="#94a3b8" letterSpacing="0.08em">
        PLAY REQUEST → DEVICE CHECK → CONCURRENT COUNT → GEO DRIFT → ALLOW
      </text>

      {/* Entry box */}
      <rect x={cx - 80} y={entryTop} width={160} height={entryH} rx={6} fill="#1e293b" stroke="#22d3ee" />
      <text x={cx} y={entryTop + entryH / 2 + 4} textAnchor="middle" fontSize={12} fontWeight={700} fill="#22d3ee">
        play request
      </text>

      {/* Entry → decision 0 */}
      <line
        x1={cx}
        y1={entryTop + entryH}
        x2={cx}
        y2={decideTop(0) - 2}
        stroke="#cbd5e1"
        strokeWidth={1.3}
        markerEnd="url(#arrGuard)"
      />

      {decisions.map((d, i) => {
        const top = decideTop(i)
        const midY = top + decideH / 2
        return (
          <g key={i}>
            <rect x={decideLeft} y={top} width={decideW} height={decideH} rx={6} fill="#0b1322" stroke={d.color} />
            <text x={cx} y={midY + 4} textAnchor="middle" fontSize={11.5} fill="#cbd5e1">
              {d.label}
            </text>

            {/* Deny / step-up callout */}
            <line
              x1={decideRight}
              y1={midY}
              x2={W - 28}
              y2={midY}
              stroke={d.failColor}
              strokeWidth={1.2}
              strokeDasharray="4 3"
            />
            <text x={W - 30} y={midY - 4} textAnchor="end" fontSize={10} fill={d.failColor}>
              {d.fail}
            </text>

            {/* Down arrow to next decision (or to allow) */}
            {i < decisions.length - 1 && (
              <line
                x1={cx}
                y1={top + decideH}
                x2={cx}
                y2={decideTop(i + 1) - 2}
                stroke="#cbd5e1"
                strokeWidth={1.3}
                markerEnd="url(#arrGuard)"
              />
            )}
          </g>
        )
      })}

      {/* Decision 2 → Allow (green arrow, clearly separated) */}
      <line
        x1={cx}
        y1={decideTop(2) + decideH}
        x2={cx}
        y2={allowTop - 2}
        stroke="#10b981"
        strokeWidth={1.6}
        markerEnd="url(#arrGuardAllow)"
      />

      {/* Allow box */}
      <rect x={cx - 90} y={allowTop} width={180} height={allowH} rx={6} fill="#10b981" fillOpacity={0.22} stroke="#10b981" />
      <text x={cx} y={allowTop + allowH / 2 + 4} textAnchor="middle" fontSize={12.5} fontWeight={700} fill="#10b981">
        allow + mint token
      </text>
    </svg>
  )
}
