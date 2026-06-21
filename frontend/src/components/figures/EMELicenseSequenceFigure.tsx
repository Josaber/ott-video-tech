import { ArrowMarker } from './_shared'

// ---------------------------------------------------------------------------
// EME license sequence — Player ↔ License URL ↔ DRMaaS
// ---------------------------------------------------------------------------
export function EMELicenseSequenceFigure() {
  // Three lifelines
  const lanes = [
    { x: 130, name: 'Player', sub: 'browser + CDM' },
    { x: 360, name: 'License URL', sub: 'your platform' },
    { x: 590, name: 'DRMaaS', sub: 'Widevine / FairPlay / PlayReady' },
  ]
  // Sequence steps
  const steps = [
    { y: 92,  from: 0, to: 0, type: 'self', label: 'encrypted event → create MediaKeySession' },
    { y: 122, from: 0, to: 1, label: 'POST license request blob' },
    { y: 156, from: 1, to: 1, type: 'self', label: 'validate entitlement (sub, geo, HDCP, concurrent)' },
    { y: 190, from: 1, to: 2, label: 'forward blob' },
    { y: 220, from: 2, to: 2, type: 'self', label: 'wrap content key for this CDM' },
    { y: 254, from: 2, to: 1, label: 'license response blob' },
    { y: 286, from: 1, to: 0, label: 'license response' },
    { y: 318, from: 0, to: 0, type: 'self', label: 'session.update() → CDM decrypts in TEE' },
  ]

  return (
    <svg
      viewBox="0 0 720 360"
      width="100%"
      role="img"
      aria-label="EME license request sequence"
      style={{ display: 'block', maxWidth: '100%' }}
    >
      <defs>
        <ArrowMarker id="eme-arrow" color="#22d3ee" />
        <ArrowMarker id="eme-arrow-amber" color="#f59e0b" />
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
          y2={350}
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
              <rect x={lane.x - 100} y={step.y - 12} width={200} height={22} rx={4} fill="#0f172a" stroke="#475569" strokeDasharray="3 3" />
              <text x={lane.x} y={step.y + 3} textAnchor="middle" fontSize={10} fill="#cbd5e1">
                {step.label}
              </text>
            </g>
          )
        }
        const from = lanes[step.from]
        const to = lanes[step.to]
        const reverse = from.x > to.x
        const lineColor = reverse ? '#f59e0b' : '#22d3ee'
        const marker = reverse ? 'url(#eme-arrow-amber)' : 'url(#eme-arrow)'
        return (
          <g key={i}>
            <line
              x1={from.x + (reverse ? -4 : 4)}
              y1={step.y}
              x2={to.x + (reverse ? 4 : -4)}
              y2={step.y}
              stroke={lineColor}
              strokeWidth={1.5}
              markerEnd={marker}
            />
            <text x={(from.x + to.x) / 2} y={step.y - 6} textAnchor="middle" fontSize={10} fill={lineColor}>
              {step.label}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
