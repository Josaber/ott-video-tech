// ---------------------------------------------------------------------------
// Codec efficiency — relative file size at equal visual quality
// ---------------------------------------------------------------------------
export function CodecEfficiencyFigure() {
  // Relative size at equal VMAF ~94. H.264 = 100, others scaled.
  const codecs = [
    { name: 'H.264 (AVC)',    year: 2003, sizePct: 100, accent: '#94a3b8' },
    { name: 'VP9',            year: 2013, sizePct: 65,  accent: '#3b82f6' },
    { name: 'H.265 (HEVC)',   year: 2013, sizePct: 50,  accent: '#22d3ee' },
    { name: 'AV1',            year: 2018, sizePct: 35,  accent: '#10b981' },
    { name: 'H.266 (VVC)',    year: 2020, sizePct: 30,  accent: '#f59e0b' },
  ]
  const barXStart = 170
  const barMaxW = 420
  const rowH = 32
  const rowGap = 10
  const yStart = 56

  return (
    <svg
      viewBox="0 0 720 344"
      width="100%"
      role="img"
      aria-label="Codec efficiency comparison"
      style={{ display: 'block', maxWidth: '100%' }}
    >
      {/* Title row */}
      <text x={36} y={28} fontSize={10.5} fontWeight={700} fill="#94a3b8" letterSpacing="0.08em">
        CODEC
      </text>
      <text x={barXStart} y={28} fontSize={10.5} fontWeight={700} fill="#94a3b8" letterSpacing="0.08em">
        FILE SIZE AT EQUAL QUALITY (VMAF ~94)
      </text>
      <text x={650} y={28} textAnchor="end" fontSize={10.5} fontWeight={700} fill="#94a3b8" letterSpacing="0.08em">
        YEAR
      </text>

      {/* Reference grid lines */}
      {[0, 25, 50, 75, 100].map((pct) => {
        const x = barXStart + (pct / 100) * barMaxW
        return (
          <g key={pct}>
            <line x1={x} y1={42} x2={x} y2={yStart + codecs.length * (rowH + rowGap)} stroke="#1e293b" />
            <text x={x} y={yStart + codecs.length * (rowH + rowGap) + 14} textAnchor="middle" fontSize={9} fill="#64748b">
              {pct}%
            </text>
          </g>
        )
      })}

      {/* Bars */}
      {codecs.map((c, i) => {
        const y = yStart + i * (rowH + rowGap)
        const w = (c.sizePct / 100) * barMaxW
        return (
          <g key={c.name}>
            <text x={36} y={y + rowH / 2 + 4} fontSize={11} fontWeight={700} fill="#cbd5e1">
              {c.name}
            </text>
            <rect x={barXStart} y={y} width={barMaxW} height={rowH} rx={4} fill="#1e293b" stroke="#1e293b" />
            <rect x={barXStart} y={y} width={w} height={rowH} rx={4} fill={c.accent} opacity={0.85} />
            <text x={barXStart + w - 8} y={y + rowH / 2 + 4} textAnchor="end" fontSize={11} fontWeight={700} fill="#0f172a">
              {c.sizePct}%
            </text>
            <text x={650} y={y + rowH / 2 + 4} textAnchor="end" fontSize={10.5} fill="#94a3b8" fontFamily="ui-monospace, monospace">
              {c.year}
            </text>
          </g>
        )
      })}

      {/* Footer note — sits BELOW the % grid labels (which land at y=280
          for 5 rows). Earlier draft placed the rect at y=244 which clipped
          the VVC bar at y=224–256. */}
      <rect x={36} y={296} width={624} height={36} rx={4} fill="#0f172a" stroke="#334155" />
      <text x={348} y={312} textAnchor="middle" fontSize={10.5} fontWeight={700} fill="#94a3b8" letterSpacing="0.08em">
        EFFICIENCY GAINS ≠ ADOPTION
      </text>
      <text x={348} y={326} textAnchor="middle" fontSize={9.5} fill="#64748b">
        H.264 still dominates because hardware decode is universal · AV1 + VVC are limited by encode time and ecosystem support
      </text>
    </svg>
  )
}
