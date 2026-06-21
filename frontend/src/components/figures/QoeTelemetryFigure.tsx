// ---------------------------------------------------------------------------
// QoE telemetry pipeline — Player → Vendor SDK / sendBeacon → Collector →
// Kafka → Flink/CMCD-join → Dashboards/Alerts. Shows where each metric
// originates and how player + CDN logs reconcile via shared session ID.
// ---------------------------------------------------------------------------
export function QoeTelemetryFigure() {
  const W = 760
  const H = 360
  // Lanes: client / ingest / storage-processing / dashboards
  const laneY = 120
  const boxH = 56
  const boxW = 144

  type Box = {
    x: number
    label: string
    sub: string
    color: string
  }
  const boxes: Box[] = [
    { x: 24,  label: 'Player',          sub: 'startup · rebuffer · ABR · errors', color: '#22d3ee' },
    { x: 200, label: 'Vendor SDK',      sub: 'Conviva · Mux · NPAW',              color: '#8b5cf6' },
    { x: 376, label: 'Collector',       sub: 'sendBeacon · gzip · retry',         color: '#10b981' },
    { x: 552, label: 'Kafka + Flink',   sub: 'session-id join with CDN log',      color: '#f59e0b' },
  ]
  const dash = { x: 200, label: 'Real-time dashboards · alerts · A/B reports', y: 256 }

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      role="img"
      aria-label="QoE telemetry pipeline from player to dashboards"
      style={{ display: 'block', maxWidth: '100%' }}
    >
      <defs>
        <marker id="qoeArr" viewBox="0 0 10 10" refX={9} refY={5} markerWidth={9} markerHeight={9} orient="auto">
          <path d="M0,0 L10,5 L0,10 z" fill="#cbd5e1" />
        </marker>
        <marker id="qoeArrAmber" viewBox="0 0 10 10" refX={9} refY={5} markerWidth={9} markerHeight={9} orient="auto">
          <path d="M0,0 L10,5 L0,10 z" fill="#f59e0b" />
        </marker>
      </defs>

      <rect x={0} y={0} width={W} height={H} fill="#0f172a" />

      <text x={W / 2} y={28} textAnchor="middle" fontSize={13} fontWeight={700} fill="#f1f5f9" letterSpacing="0.06em">
        QoE TELEMETRY PIPELINE
      </text>
      <text x={W / 2} y={48} textAnchor="middle" fontSize={11} fill="#94a3b8">
        every player event flows through this chain; CDN logs join by shared session ID
      </text>

      {/* CMCD lane callout — spans from above the Player box to past Kafka so
          it visually parallels the main row. Two lines keep it inside the box. */}
      <rect x={24} y={64} width={W - 48} height={40} rx={6} fill="#0b1322" stroke="#22d3ee" />
      <text x={W / 2} y={80} textAnchor="middle" fontSize={11.5} fontWeight={700} fill="#22d3ee">
        CMCD (CTA-5004) — player attaches session-id to every CDN segment request
      </text>
      <text x={W / 2} y={96} textAnchor="middle" fontSize={10.5} fill="#cbd5e1">
        the side channel that lets CDN access logs join the player telemetry by sid
      </text>

      {/* Stage boxes in a single row */}
      {boxes.map((b) => (
        <g key={b.label}>
          <rect x={b.x} y={laneY} width={boxW} height={boxH} rx={6} fill={b.color} fillOpacity={0.25} stroke={b.color} strokeWidth={1.5} />
          <text x={b.x + boxW / 2} y={laneY + 24} textAnchor="middle" fontSize={13} fontWeight={700} fill="#f1f5f9">
            {b.label}
          </text>
          <text x={b.x + boxW / 2} y={laneY + 44} textAnchor="middle" fontSize={9.5} fill="#cbd5e1">
            {b.sub}
          </text>
        </g>
      ))}

      {/* Forward arrows between stages */}
      {boxes.slice(0, -1).map((b, i) => {
        const next = boxes[i + 1]
        return (
          <line
            key={`arr-${i}`}
            x1={b.x + boxW + 2}
            y1={laneY + boxH / 2}
            x2={next.x - 4}
            y2={laneY + boxH / 2}
            stroke="#cbd5e1"
            strokeWidth={1.6}
            markerEnd="url(#qoeArr)"
          />
        )
      })}

      {/* Branch: Flink → dashboard */}
      <line
        x1={boxes[3].x + boxW / 2}
        y1={laneY + boxH}
        x2={boxes[3].x + boxW / 2}
        y2={dash.y - 4}
        stroke="#f59e0b"
        strokeWidth={1.6}
        markerEnd="url(#qoeArrAmber)"
      />
      <line x1={boxes[3].x + boxW / 2} y1={dash.y - 4} x2={dash.x + 520 / 2} y2={dash.y - 4} stroke="#f59e0b" strokeWidth={1.4} />
      <rect x={dash.x} y={dash.y} width={520} height={50} rx={6} fill="#f59e0b" fillOpacity={0.22} stroke="#f59e0b" strokeWidth={1.4} />
      <text x={dash.x + 260} y={dash.y + 22} textAnchor="middle" fontSize={13} fontWeight={700} fill="#fbbf24">
        Dashboards · Alerts · A/B
      </text>
      <text x={dash.x + 260} y={dash.y + 40} textAnchor="middle" fontSize={10} fill="#cbd5e1">
        slice by CDN / geo / ISP / device / app version
      </text>

      {/* Side note: CDN log joins via session id */}
      <rect x={24} y={dash.y} width={150} height={50} rx={6} fill="#1e293b" stroke="#475569" strokeDasharray="4 3" />
      <text x={99} y={dash.y + 21} textAnchor="middle" fontSize={11.5} fontWeight={700} fill="#cbd5e1">
        CDN access log
      </text>
      <text x={99} y={dash.y + 38} textAnchor="middle" fontSize={9.5} fill="#94a3b8">
        joined by sid
      </text>
      <line x1={174} y1={dash.y + 25} x2={boxes[3].x - 4} y2={laneY + boxH / 2} stroke="#475569" strokeDasharray="4 3" strokeWidth={1.3} />
    </svg>
  )
}
