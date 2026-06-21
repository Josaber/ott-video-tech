// ---------------------------------------------------------------------------
// OTT per-viewer-hour cost breakdown — stacked horizontal bar showing where
// each cent of a 5 Mbps streaming hour goes. Numbers anchored on the 2026
// "$0.02/GB negotiated CDN" baseline laid out in the cost chapter prose.
// ---------------------------------------------------------------------------
export function CostBreakdownFigure() {
  const W = 760
  const H = 320

  // Approximate per-viewer-hour breakdown at decent scale on a SVOD platform.
  // (CDN dominates; everything else is small. AV1 + per-title encoding can
  // shave 20-30% off the CDN slice at the cost of more encode time.)
  const segments = [
    { label: 'CDN egress', pct: 62, sub: '~3.3¢ / hour at $0.02/GB', color: '#22d3ee' },
    { label: 'Encode / package', pct: 12, sub: 'amortised over views', color: '#10b981' },
    { label: 'Storage', pct: 6, sub: 'S3 + cold tier blend', color: '#f59e0b' },
    { label: 'DRM license', pct: 4, sub: '$0.0001-0.001 / session', color: '#f43f5e' },
    { label: 'Captions / AD', pct: 5, sub: 'transcribe + translate', color: '#8b5cf6' },
    { label: 'Analytics / QoE', pct: 5, sub: 'Conviva / Mux / etc.', color: '#fbbf24' },
    { label: 'Misc (origin, KMS, ops)', pct: 6, sub: 'long tail', color: '#94a3b8' },
  ]

  const padL = 24
  const padR = 24
  const barY = 110
  const barH = 60
  const barW = W - padL - padR

  let runX = padL
  const placed = segments.map((s) => {
    const w = (s.pct / 100) * barW
    const seg = { ...s, x: runX, w }
    runX += w
    return seg
  })

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      role="img"
      aria-label="OTT per-viewer-hour cost breakdown"
      style={{ display: 'block', maxWidth: '100%' }}
    >
      <rect x={0} y={0} width={W} height={H} fill="#0f172a" />

      {/* Title + subtitle */}
      <text x={W / 2} y={30} textAnchor="middle" fontSize={14} fontWeight={700} fill="#f1f5f9" letterSpacing="0.06em">
        WHERE EACH PENNY GOES — per viewer-hour
      </text>
      <text x={W / 2} y={50} textAnchor="middle" fontSize={11} fill="#94a3b8">
        baseline: 5 Mbps stream, $0.02/GB negotiated CDN, SVOD at scale (≈5.3¢ total)
      </text>

      {/* Bar segments */}
      {placed.map((s) => (
        <g key={s.label}>
          <rect x={s.x} y={barY} width={s.w} height={barH} fill={s.color} fillOpacity={0.45} stroke={s.color} />
          {s.w >= 60 && (
            <text x={s.x + s.w / 2} y={barY + 24} textAnchor="middle" fontSize={13} fontWeight={700} fill="#f1f5f9">
              {s.pct}%
            </text>
          )}
          {s.w >= 60 && (
            <text x={s.x + s.w / 2} y={barY + 42} textAnchor="middle" fontSize={10} fill="#f1f5f9">
              {s.label}
            </text>
          )}
          {s.w < 60 && (
            <text x={s.x + s.w / 2} y={barY + 30} textAnchor="middle" fontSize={11} fontWeight={700} fill="#f1f5f9">
              {s.pct}%
            </text>
          )}
        </g>
      ))}

      {/* Legend (4 cols × 2 rows) — for narrow slices whose labels won't fit inside the bar */}
      {placed.map((s, i) => {
        const colW = (W - padL - padR) / 4
        const row = Math.floor(i / 4)
        const col = i % 4
        const cx = padL + col * colW + 12
        const cy = 200 + row * 32
        return (
          <g key={`leg-${s.label}`}>
            <rect x={cx} y={cy - 9} width={12} height={12} fill={s.color} rx={2} />
            <text x={cx + 18} y={cy} fontSize={10.5} fontWeight={600} fill="#f1f5f9">
              {s.label}
            </text>
            <text x={cx + 18} y={cy + 13} fontSize={9.5} fill="#94a3b8">
              {s.sub}
            </text>
          </g>
        )
      })}

      <text x={W / 2} y={H - 14} textAnchor="middle" fontSize={10.5} fill="#94a3b8">
        Original content production is bigger than everything above — it dwarfs viewer-hour costs.
      </text>
    </svg>
  )
}
