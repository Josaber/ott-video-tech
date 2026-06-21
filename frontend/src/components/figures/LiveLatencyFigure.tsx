// ---------------------------------------------------------------------------
// Live latency budget — Classic HLS / LL-HLS / WebRTC horizontal bars
// ---------------------------------------------------------------------------
export function LiveLatencyFigure() {
  const totalWidthPx = 600
  const xStart = 92
  const usableWidth = totalWidthPx
  // Max scale: 23 s for visual; the bars represent the upper-bound budget
  const SCALE = usableWidth / 23

  type Slice = { label: string; sec: number; fill: string }
  type Row = { name: string; total: string; slices: Slice[] }

  const rows: Row[] = [
    {
      name: 'Classic HLS',
      total: '9–23 s',
      slices: [
        { label: 'GOP', sec: 4, fill: '#1e3a8a' },
        { label: 'contrib', sec: 2, fill: '#1d4ed8' },
        { label: 'pack', sec: 1, fill: '#2563eb' },
        { label: 'CDN', sec: 1, fill: '#3b82f6' },
        { label: 'player buffer', sec: 15, fill: '#60a5fa' },
      ],
    },
    {
      name: 'LL-HLS',
      total: '2–3 s',
      slices: [
        { label: 'partials', sec: 0.5, fill: '#065f46' },
        { label: 'block reload', sec: 0.5, fill: '#047857' },
        { label: 'CDN', sec: 0.5, fill: '#10b981' },
        { label: 'buffer', sec: 1.5, fill: '#34d399' },
      ],
    },
    {
      name: 'WebRTC',
      total: '~500 ms',
      slices: [
        { label: 'ingest', sec: 0.1, fill: '#7c2d12' },
        { label: 'forward', sec: 0.1, fill: '#9a3412' },
        { label: 'jitter buffer', sec: 0.3, fill: '#c2410c' },
      ],
    },
  ]

  return (
    <svg
      viewBox="0 0 720 268"
      width="100%"
      role="img"
      aria-label="Live latency budget"
      style={{ display: 'block', maxWidth: '100%' }}
    >
      {/* Axis */}
      <line x1={xStart} y1={232} x2={xStart + usableWidth} y2={232} stroke="#334155" />
      {[0, 5, 10, 15, 20].map((s) => {
        const x = xStart + s * SCALE
        return (
          <g key={s}>
            <line x1={x} y1={228} x2={x} y2={236} stroke="#334155" />
            <text x={x} y={250} textAnchor="middle" fontSize={10} fill="#64748b">
              {s}s
            </text>
          </g>
        )
      })}
      <text x={xStart + usableWidth / 2} y={262} textAnchor="middle" fontSize={9.5} fill="#475569" letterSpacing="0.08em">
        GLASS-TO-GLASS LATENCY
      </text>

      {rows.map((row, ri) => {
        const y = 30 + ri * 64
        let cursor = xStart
        return (
          <g key={row.name}>
            <text x={84} y={y + 18} textAnchor="end" fontSize={11.5} fontWeight={700} fill="#e2e8f0">
              {row.name}
            </text>
            <text x={84} y={y + 32} textAnchor="end" fontSize={10} fill="#94a3b8">
              {row.total}
            </text>

            {row.slices.map((slice, si) => {
              const w = slice.sec * SCALE
              const sx = cursor
              cursor += w
              const showInside = w > 50
              return (
                <g key={si}>
                  <rect x={sx} y={y} width={w} height={36} rx={3} fill={slice.fill} opacity={0.85} />
                  {showInside && (
                    <text
                      x={sx + w / 2}
                      y={y + 22}
                      textAnchor="middle"
                      fontSize={10}
                      fontWeight={600}
                      fill="#f1f5f9"
                    >
                      {slice.label}
                    </text>
                  )}
                </g>
              )
            })}
          </g>
        )
      })}
    </svg>
  )
}
