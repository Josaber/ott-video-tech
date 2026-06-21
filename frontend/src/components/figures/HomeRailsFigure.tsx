// ---------------------------------------------------------------------------
// Catalog rail-based home page mock
// ---------------------------------------------------------------------------
export function HomeRailsFigure() {
  // Tile dimensions
  const tileW = 70
  const tileH = 42
  const tileGap = 10
  const railLabelH = 22
  const railHeight = railLabelH + tileH + 12
  const numTilesPerRail = 8

  const rails = [
    { name: 'CONTINUE WATCHING',    note: 'resume positions' },
    { name: 'BECAUSE YOU WATCHED…', note: 'content-based · per profile' },
    { name: 'TRENDING NOW',         note: 'global · recency-decayed' },
    { name: 'NEW RELEASES',         note: 'editorial' },
    { name: 'FOR YOU',              note: 'collaborative filtering' },
  ]

  // Hero banner area
  const heroH = 84

  return (
    <svg
      viewBox="0 0 720 580"
      width="100%"
      role="img"
      aria-label="Catalog home page rail layout"
      style={{ display: 'block', maxWidth: '100%' }}
    >
      {/* Phone / TV frame — 5 rails at y=168 + 76 each end at y=548, so
          frame bottom needs to be past that. */}
      <rect x={20} y={14} width={680} height={552} rx={10} fill="#0f172a" stroke="#334155" strokeWidth={1.5} />

      {/* Top nav */}
      <rect x={40} y={32} width={640} height={24} rx={4} fill="#1e293b" />
      <text x={56} y={48} fontSize={11} fontWeight={700} fill="#22d3ee" letterSpacing="0.08em">
        ★ STREAMR
      </text>
      <text x={296} y={48} fontSize={10} fill="#94a3b8" letterSpacing="0.06em">Home · Shows · Movies · My List</text>
      <circle cx={664} cy={44} r={7} fill="#1e293b" stroke="#475569" />

      {/* Hero banner */}
      <rect x={40} y={68} width={640} height={heroH} rx={6} fill="#1e293b" stroke="#22d3ee" strokeWidth={1.2} />
      <text x={60} y={90} fontSize={11} fontWeight={700} fill="#22d3ee" letterSpacing="0.08em">FEATURED</text>
      <text x={60} y={108} fontSize={14} fontWeight={700} fill="#e2e8f0">"The Last Lighthouse"</text>
      <text x={60} y={124} fontSize={10} fill="#94a3b8">a journey to the edge of the world — premieres Friday</text>
      <rect x={60} y={132} width={84} height={20} rx={4} fill="#22d3ee" />
      <text x={102} y={146} textAnchor="middle" fontSize={10} fontWeight={700} fill="#0f172a">▶ PLAY</text>
      <rect x={156} y={132} width={84} height={20} rx={4} fill="transparent" stroke="#475569" />
      <text x={198} y={146} textAnchor="middle" fontSize={10} fill="#cbd5e1">+ MY LIST</text>

      {/* Rails */}
      {rails.map((rail, ri) => {
        const yRail = 168 + ri * railHeight
        return (
          <g key={rail.name}>
            <text x={56} y={yRail + 12} fontSize={10} fontWeight={700} fill="#e2e8f0" letterSpacing="0.06em">
              {rail.name}
            </text>
            <text x={680} y={yRail + 12} textAnchor="end" fontSize={9} fill="#64748b" letterSpacing="0.04em">
              {rail.note}
            </text>
            {/* Tiles */}
            {Array.from({ length: numTilesPerRail }).map((_, ti) => {
              const x = 56 + ti * (tileW + tileGap)
              const isFocused = ri === 0 && ti === 0
              return (
                <g key={ti}>
                  <rect
                    x={x}
                    y={yRail + railLabelH}
                    width={tileW}
                    height={tileH}
                    rx={3}
                    fill="#1e293b"
                    stroke={isFocused ? '#22d3ee' : '#334155'}
                    strokeWidth={isFocused ? 2 : 1}
                  />
                  {/* Tiny decorative title bar */}
                  <line
                    x1={x + 6}
                    y1={yRail + railLabelH + tileH - 6}
                    x2={x + tileW - 6}
                    y2={yRail + railLabelH + tileH - 6}
                    stroke="#475569"
                    strokeWidth={1}
                  />
                </g>
              )
            })}
          </g>
        )
      })}

      {/* Focus annotation — below the last rail's tile row (y=560). */}
      <text x={56} y={560} fontSize={9.5} fill="#64748b" fontStyle="italic">
        rail order and tile order are personalised — the focused tile is the first decision the recommender makes
      </text>
    </svg>
  )
}
