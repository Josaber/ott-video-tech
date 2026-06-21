// ---------------------------------------------------------------------------
// HTTP versions — first-byte timeline H1 vs H2 vs H3
// ---------------------------------------------------------------------------
export function HttpVersionsFigure() {
  // Setup phases per protocol — TCP / TLS / GET / RESP, in RTT units (1 RTT = 30 ms here).
  // Each segment shows its phase. Total length = time to first byte.
  type Phase = { label: string; rttDur: number; fill: string }
  type Proto = {
    name: string
    sub: string
    phases: Phase[]
    note: string
  }

  const xStart = 100
  const oneRtt = 70 // px per RTT
  const protocols: Proto[] = [
    {
      name: 'HTTP/1.1',
      sub: 'TCP + TLS 1.3 · 2 RTT handshake',
      phases: [
        { label: 'TCP', rttDur: 1, fill: '#475569' },
        { label: 'TLS', rttDur: 1, fill: '#1d4ed8' },
        { label: 'GET', rttDur: 0.5, fill: '#22d3ee' },
        { label: 'RESP', rttDur: 0.5, fill: '#10b981' },
      ],
      note: '3 RTTs to first byte',
    },
    {
      name: 'HTTP/2',
      sub: 'TCP + TLS 1.3 · multiplexed streams',
      phases: [
        { label: 'TCP', rttDur: 1, fill: '#475569' },
        { label: 'TLS', rttDur: 1, fill: '#1d4ed8' },
        { label: 'GET', rttDur: 0.5, fill: '#22d3ee' },
        { label: 'RESP', rttDur: 0.5, fill: '#10b981' },
      ],
      note: '3 RTTs — same; later requests reuse the connection (0 RTT each)',
    },
    {
      name: 'HTTP/3',
      sub: 'QUIC over UDP · 1-RTT or 0-RTT',
      phases: [
        { label: 'QUIC + TLS', rttDur: 1, fill: '#1d4ed8' },
        { label: 'GET', rttDur: 0.5, fill: '#22d3ee' },
        { label: 'RESP', rttDur: 0.5, fill: '#10b981' },
      ],
      note: '2 RTTs first time · 1 RTT (0-RTT) on resume',
    },
  ]

  return (
    <svg
      viewBox="0 0 720 280"
      width="100%"
      role="img"
      aria-label="HTTP/1.1 vs HTTP/2 vs HTTP/3 first-byte timeline"
      style={{ display: 'block', maxWidth: '100%' }}
    >
      {/* Axis */}
      <text x={36} y={28} fontSize={10.5} fontWeight={700} fill="#94a3b8" letterSpacing="0.08em">
        TIME TO FIRST BYTE (cold start)
      </text>
      <line x1={xStart} y1={42} x2={xStart + 4 * oneRtt} y2={42} stroke="#334155" />
      {[0, 1, 2, 3].map((r) => {
        const x = xStart + r * oneRtt
        return (
          <g key={r}>
            <line x1={x} y1={38} x2={x} y2={46} stroke="#334155" />
            <text x={x} y={56} textAnchor="middle" fontSize={9.5} fill="#64748b">
              {r} RTT
            </text>
          </g>
        )
      })}

      {protocols.map((p, i) => {
        const y = 80 + i * 60
        let cursor = xStart
        return (
          <g key={p.name}>
            <text x={92} y={y + 14} textAnchor="end" fontSize={11.5} fontWeight={700} fill="#e2e8f0">
              {p.name}
            </text>
            <text x={92} y={y + 28} textAnchor="end" fontSize={9} fill="#94a3b8">
              {p.sub}
            </text>

            {p.phases.map((ph, pi) => {
              const w = ph.rttDur * oneRtt
              const sx = cursor
              cursor += w
              return (
                <g key={pi}>
                  <rect x={sx} y={y} width={w} height={32} rx={3} fill={ph.fill} opacity={0.85} />
                  {w > 36 && (
                    <text x={sx + w / 2} y={y + 21} textAnchor="middle" fontSize={10} fontWeight={600} fill="#f1f5f9">
                      {ph.label}
                    </text>
                  )}
                </g>
              )
            })}
            <text x={cursor + 8} y={y + 21} fontSize={9.5} fill="#64748b">
              {p.note}
            </text>
          </g>
        )
      })}

      {/* Footer caption */}
      <rect x={36} y={246} width={648} height={28} rx={4} fill="#0f172a" stroke="#334155" />
      <text x={360} y={264} textAnchor="middle" fontSize={10} fill="#64748b" letterSpacing="0.06em">
        1 RTT ≈ 20–80 ms over Wi-Fi · 200+ ms over poor mobile · each saved RTT shaves startup time
      </text>
    </svg>
  )
}
