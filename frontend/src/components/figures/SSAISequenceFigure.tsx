import { ArrowMarker } from './_shared'

// ---------------------------------------------------------------------------
// SSAI sequence — Player ↔ Backend ↔ Ad-Service
// ---------------------------------------------------------------------------
export function SSAISequenceFigure() {
  const lanes = [
    { x: 130, name: 'Player',     sub: 'hls.js + <video>' },
    { x: 360, name: 'Backend',    sub: 'manifest + license' },
    { x: 590, name: 'Ad-Service', sub: 'VAST + ad ts' },
  ]
  const steps: {
    y: number
    from: number
    to: number
    type?: 'self'
    label: string
    note?: string
  }[] = [
    { y: 92,  from: 0, to: 1, label: 'GET /playback/.../master.m3u8' },
    { y: 124, from: 1, to: 2, label: 'GET /vast?adId=preroll' },
    { y: 158, from: 2, to: 2, type: 'self', label: 'FFmpeg generate ad (cold ~48 s, then cached)' },
    { y: 192, from: 2, to: 1, label: 'VAST XML + ad manifest URL' },
    { y: 224, from: 1, to: 1, type: 'self', label: 'stitch ad segments + #EXT-X-DATERANGE' },
    { y: 258, from: 1, to: 0, label: 'stitched manifest + signed license URL' },
    { y: 290, from: 0, to: 2, label: 'GET ad ts (CORS, no Bearer)' },
    { y: 322, from: 0, to: 1, label: 'GET program ts + license.key (signed URL)' },
  ]

  return (
    <svg
      viewBox="0 0 720 360"
      width="100%"
      role="img"
      aria-label="SSAI manifest-stitching sequence"
      style={{ display: 'block', maxWidth: '100%' }}
    >
      <defs>
        <ArrowMarker id="ssai-arrow" color="#22d3ee" />
        <ArrowMarker id="ssai-arrow-amber" color="#f59e0b" />
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
        const marker = reverse ? 'url(#ssai-arrow-amber)' : 'url(#ssai-arrow)'
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
