// ---------------------------------------------------------------------------
// Chroma subsampling — 4:4:4 / 4:2:2 / 4:2:0 grids
// ---------------------------------------------------------------------------
export function ChromaSubsamplingFigure() {
  const cellSize = 30
  const gridCols = 4
  const gridRows = 4
  const gridWidth = cellSize * gridCols
  const gridHeight = cellSize * gridRows
  const gap = 60
  const xStart = (720 - (3 * gridWidth + 2 * gap)) / 2

  // For each format, decide which cells get chroma samples
  type Fmt = { name: string; sub: string; chromaPositions: [number, number][] }
  const allPositions: [number, number][] = []
  for (let r = 0; r < gridRows; r++) for (let c = 0; c < gridCols; c++) allPositions.push([r, c])
  const formats: Fmt[] = [
    {
      name: '4:4:4',
      sub: 'full chroma · mastering',
      chromaPositions: allPositions,
    },
    {
      name: '4:2:2',
      sub: 'half horizontal · broadcast',
      chromaPositions: allPositions.filter(([, c]) => c % 2 === 0),
    },
    {
      name: '4:2:0',
      sub: 'half horizontal + vertical · streaming default',
      chromaPositions: allPositions.filter(([r, c]) => r % 2 === 0 && c % 2 === 0),
    },
  ]

  return (
    <svg
      viewBox="0 0 720 260"
      width="100%"
      role="img"
      aria-label="Chroma subsampling 4:4:4 vs 4:2:2 vs 4:2:0"
      style={{ display: 'block', maxWidth: '100%' }}
    >
      {formats.map((fmt, fi) => {
        const x0 = xStart + fi * (gridWidth + gap)
        const y0 = 36
        return (
          <g key={fmt.name}>
            {/* Title */}
            <text x={x0 + gridWidth / 2} y={24} textAnchor="middle" fontSize={13} fontWeight={700} fill="#22d3ee" letterSpacing="0.06em">
              {fmt.name}
            </text>
            {/* Grid cells with luma dot */}
            {allPositions.map(([r, c]) => {
              const cx = x0 + c * cellSize + cellSize / 2
              const cy = y0 + r * cellSize + cellSize / 2
              return (
                <g key={`luma-${r}-${c}`}>
                  <rect x={x0 + c * cellSize} y={y0 + r * cellSize} width={cellSize} height={cellSize} fill="#1e293b" stroke="#334155" />
                  <circle cx={cx} cy={cy} r={3.5} fill="#e2e8f0" />
                </g>
              )
            })}
            {/* Chroma overlay */}
            {fmt.chromaPositions.map(([r, c]) => {
              const cx = x0 + c * cellSize + cellSize / 2
              const cy = y0 + r * cellSize + cellSize / 2
              return <circle key={`chroma-${r}-${c}`} cx={cx + 7} cy={cy - 6} r={3.5} fill="#f59e0b" />
            })}
            {/* Sub-label */}
            <text x={x0 + gridWidth / 2} y={y0 + gridHeight + 18} textAnchor="middle" fontSize={10} fill="#94a3b8">
              {fmt.sub}
            </text>
            <text x={x0 + gridWidth / 2} y={y0 + gridHeight + 32} textAnchor="middle" fontSize={9.5} fontWeight={700} fill="#cbd5e1" fontFamily="ui-monospace, monospace">
              {fmt.chromaPositions.length} / {gridRows * gridCols} chroma samples
            </text>
          </g>
        )
      })}

      {/* Legend */}
      <g transform="translate(60, 224)">
        <circle cx={6} cy={8} r={4} fill="#e2e8f0" />
        <text x={18} y={12} fontSize={10.5} fill="#cbd5e1">
          <tspan fontWeight={700}>luma</tspan> (Y · full grid in all modes)
        </text>
        <circle cx={266} cy={8} r={4} fill="#f59e0b" />
        <text x={278} y={12} fontSize={10.5} fill="#cbd5e1">
          <tspan fontWeight={700}>chroma</tspan> (Cb / Cr · subsampled)
        </text>
      </g>
    </svg>
  )
}
