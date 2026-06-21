import { ArrowMarker } from './_shared'

// ---------------------------------------------------------------------------
// Subscription state machine
// ---------------------------------------------------------------------------
export function SubscriptionStateMachineFigure() {
  const states = {
    TRIAL:    { x: 88,  y: 50,  w: 140, h: 60, accent: '#22d3ee' },
    ACTIVE:   { x: 300, y: 50,  w: 140, h: 60, accent: '#10b981' },
    PAST_DUE: { x: 512, y: 150, w: 140, h: 60, accent: '#f59e0b' },
    DUNNING:  { x: 300, y: 250, w: 140, h: 60, accent: '#f97316' },
    CANCELED: { x: 88,  y: 250, w: 140, h: 60, accent: '#94a3b8' },
  } as const

  const transitions: { from: keyof typeof states; to: keyof typeof states; label: string; dx?: number; dy?: number }[] = [
    { from: 'TRIAL',    to: 'ACTIVE',   label: 'trial ends · charge ok' },
    { from: 'TRIAL',    to: 'CANCELED', label: 'user cancels' },
    { from: 'ACTIVE',   to: 'PAST_DUE', label: 'charge fails' },
    { from: 'ACTIVE',   to: 'CANCELED', label: 'user cancels' },
    { from: 'PAST_DUE', to: 'ACTIVE',   label: 'retry ok' },
    { from: 'PAST_DUE', to: 'DUNNING',  label: 'retry fails' },
    { from: 'DUNNING',  to: 'ACTIVE',   label: 'recovered' },
    { from: 'DUNNING',  to: 'CANCELED', label: 'max retries' },
    { from: 'CANCELED', to: 'ACTIVE',   label: 're-subscribe' },
  ]

  const center = (key: keyof typeof states) => {
    const s = states[key]
    return { cx: s.x + s.w / 2, cy: s.y + s.h / 2, s }
  }

  return (
    <svg
      viewBox="0 0 720 340"
      width="100%"
      role="img"
      aria-label="Subscription state machine"
      style={{ display: 'block', maxWidth: '100%' }}
    >
      <defs>
        <ArrowMarker id="sub-arrow" color="#475569" />
      </defs>

      {/* Transition lines (drawn before nodes so arrowheads land on box
          edges). Bidirectional pairs (ACTIVE↔PAST_DUE, ACTIVE↔CANCELED,
          DUNNING→ACTIVE etc.) would otherwise overlap at the same line
          position and their midpoint labels would stack on top of each
          other. Offset both line endpoints + label perpendicular to the
          line direction by 8 px — forward and reverse end up on parallel
          tracks with distinct label positions. */}
      {transitions.map((t, i) => {
        const a = center(t.from)
        const b = center(t.to)
        const dx = b.cx - a.cx
        const dy = b.cy - a.cy
        const len = Math.sqrt(dx * dx + dy * dy)
        const ux = dx / len
        const uy = dy / len
        // Approximate edge offset using half-width or half-height depending on dominant axis
        const inset = (s: typeof a.s) =>
          Math.abs(ux) * (s.w / 2) > Math.abs(uy) * (s.h / 2)
            ? s.w / 2 + 4
            : s.h / 2 + 4
        // Perpendicular unit vector (rotated 90° CW). Reversing the line
        // (b→a instead of a→b) flips (ux,uy) and therefore flips this
        // perpendicular too, so forward and reverse naturally land on
        // opposite sides.
        const perpX = -uy
        const perpY = ux
        const PARALLEL_OFFSET = 8
        const x1 = a.cx + ux * inset(a.s) + perpX * PARALLEL_OFFSET
        const y1 = a.cy + uy * inset(a.s) + perpY * PARALLEL_OFFSET
        const x2 = b.cx - ux * inset(b.s) + perpX * PARALLEL_OFFSET
        const y2 = b.cy - uy * inset(b.s) + perpY * PARALLEL_OFFSET
        const mx = (x1 + x2) / 2
        const my = (y1 + y2) / 2
        return (
          <g key={i}>
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#475569" strokeWidth={1.3} markerEnd="url(#sub-arrow)" />
            <rect x={mx - 58} y={my - 9} width={116} height={16} rx={3} fill="#0f172a" opacity={0.92} />
            <text x={mx} y={my + 3} textAnchor="middle" fontSize={9.5} fill="#cbd5e1">
              {t.label}
            </text>
          </g>
        )
      })}

      {/* States */}
      {(Object.keys(states) as (keyof typeof states)[]).map((key) => {
        const s = states[key]
        return (
          <g key={key}>
            <rect x={s.x} y={s.y} width={s.w} height={s.h} rx={8} fill="#1e293b" stroke={s.accent} strokeWidth={1.5} />
            <text x={s.x + s.w / 2} y={s.y + 30} textAnchor="middle" fontSize={13} fontWeight={700} fill={s.accent} letterSpacing="0.08em">
              {key}
            </text>
            <text x={s.x + s.w / 2} y={s.y + 48} textAnchor="middle" fontSize={9.5} fill="#94a3b8">
              {key === 'ACTIVE' ? 'plays everything' :
               key === 'TRIAL' ? 'plays · no charge yet' :
               key === 'PAST_DUE' ? 'plays · retry in progress' :
               key === 'DUNNING' ? 'plays · 7-day grace' :
               'access cut'}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
