// ---------------------------------------------------------------------------
// Audio sampling — continuous wave + discrete samples
// ---------------------------------------------------------------------------
export function AudioSamplingFigure() {
  const xStart = 60
  const xEnd = 660
  const yMid = 110
  const amp = 60
  const cycles = 2.5
  const numSamples = 20

  // Continuous wave path
  const wavePoints: string[] = []
  for (let i = 0; i <= 240; i++) {
    const x = xStart + (i / 240) * (xEnd - xStart)
    const phase = (i / 240) * cycles * 2 * Math.PI
    const y = yMid - amp * Math.sin(phase)
    wavePoints.push(`${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`)
  }

  // Discrete sample dots
  const samples: { x: number; y: number }[] = []
  for (let i = 0; i < numSamples; i++) {
    const x = xStart + (i / (numSamples - 1)) * (xEnd - xStart)
    const phase = (i / (numSamples - 1)) * cycles * 2 * Math.PI
    const y = yMid - amp * Math.sin(phase)
    samples.push({ x, y })
  }

  return (
    <svg
      viewBox="0 0 720 240"
      width="100%"
      role="img"
      aria-label="Audio sampling — continuous wave and discrete samples"
      style={{ display: 'block', maxWidth: '100%' }}
    >
      {/* Axis */}
      <line x1={xStart} y1={yMid} x2={xEnd} y2={yMid} stroke="#334155" strokeDasharray="3 4" />
      <text x={36} y={yMid + 4} fontSize={10} fill="#64748b">0</text>
      <text x={36} y={yMid - amp + 4} fontSize={10} fill="#64748b">+1</text>
      <text x={36} y={yMid + amp + 4} fontSize={10} fill="#64748b">−1</text>

      {/* Continuous wave */}
      <path d={wavePoints.join(' ')} stroke="#22d3ee" strokeWidth={1.5} fill="none" opacity={0.7} strokeDasharray="2 3" />

      {/* Sample sticks + dots */}
      {samples.map((p, i) => (
        <g key={i}>
          <line x1={p.x} y1={yMid} x2={p.x} y2={p.y} stroke="#f59e0b" strokeWidth={1} opacity={0.5} />
          <circle cx={p.x} cy={p.y} r={3.5} fill="#f59e0b" />
        </g>
      ))}

      {/* Labels */}
      <text x={xStart} y={28} fontSize={10.5} fontWeight={700} fill="#22d3ee" letterSpacing="0.08em">
        CONTINUOUS PRESSURE WAVE
      </text>
      <text x={xEnd} y={28} textAnchor="end" fontSize={10.5} fontWeight={700} fill="#f59e0b" letterSpacing="0.08em">
        DISCRETE SAMPLES · {numSamples} pts shown
      </text>

      {/* Footer caption */}
      <rect x={60} y={196} width={600} height={32} rx={4} fill="#0f172a" stroke="#334155" />
      <text x={360} y={212} textAnchor="middle" fontSize={10.5} fontWeight={700} fill="#94a3b8" letterSpacing="0.08em">
        SAMPLE RATE = SAMPLES / SECOND
      </text>
      <text x={360} y={224} textAnchor="middle" fontSize={9.5} fill="#64748b">
        Nyquist: must exceed 2× the highest frequency you want to preserve · 44.1 kHz covers 22 kHz, beyond audible
      </text>
    </svg>
  )
}
