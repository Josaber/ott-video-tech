// ---------------------------------------------------------------------------
// Gamut comparison — schematic CIE chromaticity with nested primary triangles
// ---------------------------------------------------------------------------
export function GamutFigure() {
  // Map CIE x in [0, 0.8] → SVG x in [60, 540]
  // Map CIE y in [0, 0.9] → SVG y in [340, 20] (inverted)
  const X0 = 60
  const X1 = 540
  const Y0 = 340
  const Y1 = 20
  const sx = (x: number) => X0 + (x / 0.8) * (X1 - X0)
  const sy = (y: number) => Y0 - (y / 0.9) * (Y0 - Y1)

  // Approximate CIE 1931 horseshoe with sampled points (wavelength → x,y)
  const horseshoe: [number, number][] = [
    [0.175, 0.005], [0.165, 0.018], [0.155, 0.030], [0.140, 0.045], [0.120, 0.060],
    [0.090, 0.100], [0.060, 0.180], [0.045, 0.260], [0.040, 0.354], [0.040, 0.500],
    [0.080, 0.700], [0.170, 0.800], [0.230, 0.825], [0.290, 0.815], [0.355, 0.785],
    [0.450, 0.500], [0.540, 0.450], [0.620, 0.380], [0.730, 0.265], [0.735, 0.265],
  ]
  const horseshoePoints = horseshoe.map(([x, y]) => `${sx(x).toFixed(1)},${sy(y).toFixed(1)}`).join(' ')

  // Color space primaries (CIE x,y)
  const spaces = [
    {
      name: 'sRGB / BT.709',
      accent: '#94a3b8',
      pts: [[0.64, 0.33], [0.30, 0.60], [0.15, 0.06]] as [number, number][],
    },
    {
      name: 'DCI-P3',
      accent: '#22d3ee',
      pts: [[0.68, 0.32], [0.265, 0.69], [0.15, 0.06]] as [number, number][],
    },
    {
      name: 'BT.2020',
      accent: '#f59e0b',
      pts: [[0.708, 0.292], [0.170, 0.797], [0.131, 0.046]] as [number, number][],
    },
  ]

  return (
    <svg
      viewBox="0 0 720 400"
      width="100%"
      role="img"
      aria-label="Color gamut comparison on the CIE 1931 chromaticity diagram"
      style={{ display: 'block', maxWidth: '100%' }}
    >
      {/* Title */}
      <text x={36} y={28} fontSize={10.5} fontWeight={700} fill="#94a3b8" letterSpacing="0.08em">
        CIE 1931 CHROMATICITY · schematic
      </text>

      {/* Horseshoe outline of visible colors */}
      <polygon points={horseshoePoints + ' ' + horseshoePoints.split(' ')[0]} fill="#0f172a" stroke="#475569" strokeWidth={1.2} />
      <text x={sx(0.4)} y={sy(0.05) + 4} textAnchor="middle" fontSize={9.5} fill="#64748b" fontStyle="italic">
        visible spectrum
      </text>

      {/* D65 white point */}
      <circle cx={sx(0.3127)} cy={sy(0.329)} r={4} fill="#e2e8f0" />
      <text x={sx(0.3127) + 10} y={sy(0.329) + 4} fontSize={10} fill="#cbd5e1">
        D65 white
      </text>

      {/* Color-space triangles */}
      {spaces.map((s) => {
        const pts = s.pts.map(([x, y]) => `${sx(x).toFixed(1)},${sy(y).toFixed(1)}`).join(' ')
        return (
          <g key={s.name}>
            <polygon points={pts} fill={s.accent} fillOpacity={0.08} stroke={s.accent} strokeWidth={1.6} />
          </g>
        )
      })}

      {/* Legend at right */}
      <g transform="translate(560, 60)">
        <text x={0} y={0} fontSize={10.5} fontWeight={700} fill="#94a3b8" letterSpacing="0.08em">
          GAMUT
        </text>
        {spaces.map((s, i) => (
          <g key={s.name} transform={`translate(0, ${24 + i * 36})`}>
            <rect x={0} y={0} width={20} height={14} rx={2} fill={s.accent} fillOpacity={0.35} stroke={s.accent} />
            <text x={28} y={11} fontSize={11} fontWeight={700} fill={s.accent}>
              {s.name}
            </text>
            <text x={28} y={24} fontSize={9.5} fill="#94a3b8">
              {i === 0 ? 'web · HD SDR' : i === 1 ? 'cinema · Apple' : 'UHD HDR'}
            </text>
          </g>
        ))}
      </g>

      {/* Footer caption */}
      <rect x={36} y={360} width={648} height={32} rx={4} fill="#0f172a" stroke="#334155" />
      <text x={360} y={376} textAnchor="middle" fontSize={10} fontWeight={700} fill="#94a3b8" letterSpacing="0.08em">
        EACH SPACE = 3 PRIMARIES + WHITE POINT → REPRODUCIBLE COLORS
      </text>
      <text x={360} y={388} textAnchor="middle" fontSize={9.5} fill="#64748b">
        outside the visible horseshoe is unreachable · larger triangle = more colors but harder display
      </text>
    </svg>
  )
}
