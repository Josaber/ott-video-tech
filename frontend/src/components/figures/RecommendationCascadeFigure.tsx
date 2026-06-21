// ---------------------------------------------------------------------------
// Recommendation 4-stage cascade — recall → coarse rank → fine rank → rerank.
// Funnel of progressively narrower rectangles with item counts and latency
// budgets per stage.
// ---------------------------------------------------------------------------
export function RecommendationCascadeFigure() {
  const W = 720
  const H = 360

  const stages = [
    { label: 'Catalog', count: '50,000 items', budget: 'offline', sub: 'every asset that exists', color: '#475569' },
    { label: 'Recall', count: '10,000 items', budget: '20 ms', sub: 'Milvus ANN + collaborative-filtering + hot list', color: '#22d3ee' },
    { label: 'Coarse rank', count: '1,000 items', budget: '40 ms', sub: 'DSSM two-tower (Triton)', color: '#10b981' },
    { label: 'Fine rank', count: '100 items', budget: '60 ms', sub: 'DIN / SIM (Triton)', color: '#f59e0b' },
    { label: 'Rerank', count: '20 items', budget: '20 ms', sub: 'multi-objective · diversity · explore', color: '#f43f5e' },
  ]

  const rowH = 56
  const gapY = 6
  const maxW = W - 80

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      role="img"
      aria-label="Recommendation cascade funnel from catalog to final ranked list"
      style={{ display: 'block', maxWidth: '100%' }}
    >
      <rect x={0} y={0} width={W} height={H} fill="#0f172a" />
      <text x={W / 2} y={26} textAnchor="middle" fontSize={11} fill="#94a3b8" letterSpacing="0.08em">
        RECALL → COARSE → FINE → RERANK &nbsp; · &nbsp; ~140 ms end-to-end budget
      </text>

      {stages.map((s, i) => {
        const w = maxW * (1 - i * 0.16)
        const x = (W - w) / 2
        const y = 44 + i * (rowH + gapY)
        return (
          <g key={s.label}>
            <rect
              x={x}
              y={y}
              width={w}
              height={rowH}
              rx={6}
              fill={s.color}
              fillOpacity={i === 0 ? 0.16 : 0.3}
              stroke={s.color}
            />
            <text x={x + 14} y={y + 22} fontSize={13} fontWeight={700} fill="#f1f5f9">
              {s.label}
            </text>
            <text x={x + 14} y={y + 40} fontSize={10.5} fill="#cbd5e1">
              {s.sub}
            </text>
            <text x={x + w - 14} y={y + 22} textAnchor="end" fontSize={12} fontWeight={700} fill="#f1f5f9">
              {s.count}
            </text>
            <text x={x + w - 14} y={y + 40} textAnchor="end" fontSize={10.5} fill="#cbd5e1">
              {s.budget}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
