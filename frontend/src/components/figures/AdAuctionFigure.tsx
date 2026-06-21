// ---------------------------------------------------------------------------
// Ad operations — waterfall (sequential) vs unified auction (parallel) for ad
// inventory. Same demand sources, different decision topology.
// ---------------------------------------------------------------------------
export function AdAuctionFigure() {
  const W = 720
  const H = 360
  const colL = 'waterfall'
  const colR = 'unified'

  const bidders = [
    { name: 'DSP A', cpm: '$4.20', color: '#22d3ee' },
    { name: 'DSP B', cpm: '$3.10', color: '#10b981' },
    { name: 'DSP C', cpm: '$5.50', color: '#f59e0b' },
    { name: 'House',  cpm: '$1.80', color: '#8b5cf6' },
  ]

  const padX = 40
  const colW = (W - padX * 3) / 2
  const leftX = padX
  const rightX = padX + colW + padX

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      role="img"
      aria-label="Waterfall versus unified auction comparison"
      style={{ display: 'block', maxWidth: '100%' }}
    >
      <rect x={0} y={0} width={W} height={H} fill="#0f172a" />

      {[
        { x: leftX, label: 'WATERFALL', sub: 'sequential, ~400 ms total, latency stacks', color: '#94a3b8', key: colL },
        { x: rightX, label: 'UNIFIED AUCTION', sub: 'parallel, ~150 ms, highest bid wins', color: '#22d3ee', key: colR },
      ].map((col) => (
        <g key={col.key}>
          <rect x={col.x} y={20} width={colW} height={H - 40} rx={8} fill="#0b1322" stroke="#1e293b" />
          <text x={col.x + colW / 2} y={44} textAnchor="middle" fontSize={13} fontWeight={700} fill={col.color} letterSpacing="0.08em">
            {col.label}
          </text>
          <text x={col.x + colW / 2} y={60} textAnchor="middle" fontSize={10} fill="#94a3b8">
            {col.sub}
          </text>
        </g>
      ))}

      <g>
        {bidders.map((b, i) => {
          const y = 88 + i * 52
          return (
            <g key={`l-${b.name}`}>
              <rect x={leftX + 24} y={y} width={colW - 48} height={36} rx={5} fill={b.color} fillOpacity={0.25} stroke={b.color} />
              <text x={leftX + 36} y={y + 22} fontSize={12} fontWeight={700} fill="#f1f5f9">
                {i + 1}. {b.name}
              </text>
              <text x={leftX + colW - 36} y={y + 22} textAnchor="end" fontSize={11} fill="#cbd5e1">
                {b.cpm}
              </text>
            </g>
          )
        })}
        <text x={leftX + colW / 2} y={H - 36} textAnchor="middle" fontSize={10} fill="#f43f5e">
          first bidder to clear price floor wins → DSP A wins at $4.20
        </text>
        <text x={leftX + colW / 2} y={H - 22} textAnchor="middle" fontSize={10} fill="#94a3b8">
          ($5.50 from DSP C never queried)
        </text>
      </g>

      <g>
        {bidders.map((b, i) => {
          const y = 88 + i * 52
          return (
            <g key={`r-${b.name}`}>
              <rect x={rightX + 24} y={y} width={colW - 48} height={36} rx={5} fill={b.color} fillOpacity={0.25} stroke={b.color} />
              <text x={rightX + 36} y={y + 22} fontSize={12} fontWeight={700} fill="#f1f5f9">
                {b.name}
              </text>
              <text x={rightX + colW - 36} y={y + 22} textAnchor="end" fontSize={11} fill="#cbd5e1">
                {b.cpm}
              </text>
            </g>
          )
        })}
        <text x={rightX + colW / 2} y={H - 36} textAnchor="middle" fontSize={10} fill="#10b981">
          all bids collected simultaneously → DSP C wins at $5.50
        </text>
        <text x={rightX + colW / 2} y={H - 22} textAnchor="middle" fontSize={10} fill="#94a3b8">
          (publisher revenue uplift ~25-30% in practice)
        </text>
      </g>
    </svg>
  )
}
