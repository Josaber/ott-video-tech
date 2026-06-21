// ---------------------------------------------------------------------------
// CMS editorial workflow — six-state lifecycle from draft to archived, with
// retreat arrows for rejections and unscheduling.
// ---------------------------------------------------------------------------
export function CmsWorkflowFigure() {
  const W = 820
  const H = 320
  const states = [
    { id: 'Draft', desc: 'editor working', color: '#94a3b8' },
    { id: 'Review', desc: 'legal + QC', color: '#8b5cf6' },
    { id: 'Scheduled', desc: 'rights window pending', color: '#22d3ee' },
    { id: 'Live', desc: 'visible in catalog', color: '#10b981' },
    { id: 'Hidden', desc: 'soft-removed', color: '#f59e0b' },
    { id: 'Archived', desc: 'rights expired', color: '#475569' },
  ]
  const boxW = 96
  const boxH = 64
  const padX = 24
  const gap = (W - padX * 2 - states.length * boxW) / (states.length - 1)
  const xOf = (i: number) => padX + i * (boxW + gap)
  const yTop = 96
  const cy = yTop + boxH / 2

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      role="img"
      aria-label="CMS editorial state machine"
      style={{ display: 'block', maxWidth: '100%' }}
    >
      <defs>
        <marker id="arrCmsFwd" viewBox="0 0 10 10" refX={9} refY={5} markerWidth={10} markerHeight={10} orient="auto">
          <path d="M0,0 L10,5 L0,10 z" fill="#cbd5e1" />
        </marker>
        <marker id="arrCmsBack" viewBox="0 0 10 10" refX={9} refY={5} markerWidth={10} markerHeight={10} orient="auto">
          <path d="M0,0 L10,5 L0,10 z" fill="#f43f5e" />
        </marker>
        <marker id="arrCmsCyan" viewBox="0 0 10 10" refX={9} refY={5} markerWidth={10} markerHeight={10} orient="auto">
          <path d="M0,0 L10,5 L0,10 z" fill="#22d3ee" />
        </marker>
      </defs>
      <rect x={0} y={0} width={W} height={H} fill="#0f172a" />
      <text x={W / 2} y={32} textAnchor="middle" fontSize={12} fontWeight={700} fill="#f1f5f9" letterSpacing="0.06em">
        EDITORIAL LIFECYCLE
      </text>
      <text x={W / 2} y={52} textAnchor="middle" fontSize={11} fill="#94a3b8">
        DRAFT → REVIEW → SCHEDULED → LIVE → HIDDEN → ARCHIVED
      </text>

      {/* State boxes */}
      {states.map((s, i) => (
        <g key={s.id}>
          <rect x={xOf(i)} y={yTop} width={boxW} height={boxH} rx={6} fill={s.color} fillOpacity={0.3} stroke={s.color} strokeWidth={1.4} />
          <text x={xOf(i) + boxW / 2} y={yTop + 28} textAnchor="middle" fontSize={13.5} fontWeight={700} fill="#f1f5f9">
            {s.id}
          </text>
          <text x={xOf(i) + boxW / 2} y={yTop + 48} textAnchor="middle" fontSize={10} fill="#cbd5e1">
            {s.desc}
          </text>
        </g>
      ))}

      {/* Forward arrows — straight, centred between boxes */}
      {states.slice(0, -1).map((_, i) => {
        const x1 = xOf(i) + boxW + 3
        const x2 = xOf(i + 1) - 6
        return (
          <line
            key={`fwd-${i}`}
            x1={x1}
            y1={cy}
            x2={x2}
            y2={cy}
            stroke="#cbd5e1"
            strokeWidth={1.6}
            markerEnd="url(#arrCmsFwd)"
          />
        )
      })}

      {/* Review → Draft (rejected) — dip below the row */}
      <path
        d={`M ${xOf(1) + 8} ${cy + boxH / 2} Q ${(xOf(0) + xOf(1) + boxW) / 2} ${cy + boxH / 2 + 56} ${xOf(0) + boxW - 8} ${cy + boxH / 2}`}
        stroke="#f43f5e"
        strokeWidth={1.8}
        fill="none"
        markerEnd="url(#arrCmsBack)"
      />
      <text
        x={(xOf(0) + boxW + xOf(1)) / 2}
        y={cy + boxH / 2 + 68}
        textAnchor="middle"
        fontSize={11}
        fontWeight={600}
        fill="#f43f5e"
      >
        rejected
      </text>

      {/* Hidden → Live (un-hide) */}
      <path
        d={`M ${xOf(4) + 8} ${cy + boxH / 2} Q ${(xOf(3) + xOf(4) + boxW) / 2} ${cy + boxH / 2 + 56} ${xOf(3) + boxW - 8} ${cy + boxH / 2}`}
        stroke="#22d3ee"
        strokeWidth={1.8}
        fill="none"
        markerEnd="url(#arrCmsCyan)"
      />
      <text
        x={(xOf(3) + boxW + xOf(4)) / 2}
        y={cy + boxH / 2 + 68}
        textAnchor="middle"
        fontSize={11}
        fontWeight={600}
        fill="#22d3ee"
      >
        un-hide
      </text>
    </svg>
  )
}
