import { ArrowMarker } from './_shared'

// ---------------------------------------------------------------------------
// Auth & session — JWT issuance, refresh, token_version revocation
// ---------------------------------------------------------------------------
export function AuthRefreshFlowFigure() {
  const lanes = [
    { x: 130, name: 'Client',  sub: 'SPA · localStorage' },
    { x: 360, name: 'Backend', sub: 'Spring Security' },
    { x: 590, name: 'DB',      sub: 'Postgres · Caffeine cache' },
  ]
  const steps: {
    y: number
    from: number
    to: number
    type?: 'self'
    label: string
  }[] = [
    { y: 92,  from: 0, to: 1, label: 'POST /auth/login {user, pw}' },
    { y: 122, from: 1, to: 2, label: 'SELECT user, token_version' },
    { y: 152, from: 1, to: 0, label: 'access (15 m, tv=N) + refresh (24 h, tv=N)' },
    { y: 184, from: 0, to: 1, label: 'GET /api/... Bearer expired access' },
    { y: 208, from: 1, to: 1, type: 'self', label: 'EME-style 401: typ ok, exp failed' },
    { y: 232, from: 0, to: 1, label: 'POST /auth/refresh {refresh}' },
    { y: 256, from: 1, to: 2, label: 'check tv matches user.token_version' },
    { y: 286, from: 1, to: 0, label: 'fresh access + refresh, retry original' },
    { y: 316, from: 1, to: 2, type: 'self', label: 'change-password: UPDATE token_version = N+1' },
    { y: 346, from: 1, to: 0, label: 'tokens stamped tv=N+1 (caller stays signed in)' },
  ]

  return (
    <svg
      viewBox="0 0 720 384"
      width="100%"
      role="img"
      aria-label="JWT issue, refresh and token_version revocation"
      style={{ display: 'block', maxWidth: '100%' }}
    >
      <defs>
        <ArrowMarker id="auth-arrow" color="#22d3ee" />
        <ArrowMarker id="auth-arrow-amber" color="#f59e0b" />
      </defs>

      {/* Lane headers */}
      {lanes.map((lane) => (
        <g key={lane.name}>
          <rect x={lane.x - 70} y={14} width={140} height={44} rx={6} fill="#1e293b" stroke="#334155" />
          <text x={lane.x} y={32} textAnchor="middle" fontSize={11.5} fontWeight={700} fill="#22d3ee" letterSpacing="0.06em">
            {lane.name.toUpperCase()}
          </text>
          <text x={lane.x} y={48} textAnchor="middle" fontSize={9.5} fill="#94a3b8">
            {lane.sub}
          </text>
        </g>
      ))}

      {/* Lifelines */}
      {lanes.map((lane) => (
        <line
          key={lane.x}
          x1={lane.x}
          y1={58}
          x2={lane.x}
          y2={372}
          stroke="#334155"
          strokeWidth={1}
          strokeDasharray="3 4"
        />
      ))}

      {/* Steps */}
      {steps.map((step, i) => {
        if (step.type === 'self') {
          const lane = lanes[step.from]
          return (
            <g key={i}>
              <rect x={lane.x - 130} y={step.y - 12} width={260} height={22} rx={4} fill="#0f172a" stroke="#475569" strokeDasharray="3 3" />
              <text x={lane.x} y={step.y + 3} textAnchor="middle" fontSize={10} fill="#cbd5e1">
                {step.label}
              </text>
            </g>
          )
        }
        const from = lanes[step.from]
        const to = lanes[step.to]
        const reverse = from.x > to.x
        const color = reverse ? '#f59e0b' : '#22d3ee'
        const marker = reverse ? 'url(#auth-arrow-amber)' : 'url(#auth-arrow)'
        return (
          <g key={i}>
            <line
              x1={from.x + (reverse ? -4 : 4)}
              y1={step.y}
              x2={to.x + (reverse ? 4 : -4)}
              y2={step.y}
              stroke={color}
              strokeWidth={1.5}
              markerEnd={marker}
            />
            <text x={(from.x + to.x) / 2} y={step.y - 6} textAnchor="middle" fontSize={10} fill={color}>
              {step.label}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
