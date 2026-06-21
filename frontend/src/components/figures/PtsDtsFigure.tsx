// ---------------------------------------------------------------------------
// PTS vs DTS — delivery (decode) order vs display order
// ---------------------------------------------------------------------------
export function PtsDtsFigure() {
  // Frames in DELIVERY order. Each carries (DTS, PTS).
  // Equivalent display order: I B B P B B P  (positions 0-6)
  const frames = [
    { type: 'I', dts: 0, pts: 0 },
    { type: 'P', dts: 1, pts: 3 },
    { type: 'B', dts: 2, pts: 1 },
    { type: 'B', dts: 3, pts: 2 },
    { type: 'P', dts: 4, pts: 6 },
    { type: 'B', dts: 5, pts: 4 },
    { type: 'B', dts: 6, pts: 5 },
  ]
  const fw = 64
  const fg = 18
  const xStart = (720 - (frames.length * fw + (frames.length - 1) * fg)) / 2

  const color = (t: string) => {
    if (t === 'I') return { fill: '#22d3ee', text: '#0f172a' }
    if (t === 'P') return { fill: '#1d4ed8', text: '#f1f5f9' }
    return { fill: '#475569', text: '#f1f5f9' }
  }

  const yTop = 60
  const yBot = 200
  const boxH = 52

  return (
    <svg
      viewBox="0 0 720 304"
      width="100%"
      role="img"
      aria-label="DTS delivery order vs PTS display order"
      style={{ display: 'block', maxWidth: '100%' }}
    >
      {/* Row labels */}
      <text x={36} y={32} fontSize={10.5} fontWeight={700} fill="#22d3ee" letterSpacing="0.08em">
        DELIVERY ORDER · DTS — what the decoder receives
      </text>
      <text x={36} y={184} fontSize={10.5} fontWeight={700} fill="#f59e0b" letterSpacing="0.08em">
        DISPLAY ORDER · PTS — what the viewer sees
      </text>

      {/* Delivery row */}
      {frames.map((f, i) => {
        const x = xStart + i * (fw + fg)
        const c = color(f.type)
        return (
          <g key={`d-${i}`}>
            <rect x={x} y={yTop} width={fw} height={boxH} rx={5} fill={c.fill} />
            <text x={x + fw / 2} y={yTop + 22} textAnchor="middle" fontSize={18} fontWeight={700} fill={c.text}>
              {f.type}
            </text>
            <text x={x + fw / 2} y={yTop + 40} textAnchor="middle" fontSize={9.5} fill={c.text} fontFamily="ui-monospace, monospace">
              DTS={f.dts}
            </text>
            <text x={x + fw / 2} y={yTop - 6} textAnchor="middle" fontSize={9.5} fill="#94a3b8">
              PTS={f.pts}
            </text>
          </g>
        )
      })}

      {/* Display row — sort frames by PTS */}
      {[...frames]
        .sort((a, b) => a.pts - b.pts)
        .map((f, i) => {
          const x = xStart + i * (fw + fg)
          const c = color(f.type)
          return (
            <g key={`p-${i}`}>
              <rect x={x} y={yBot} width={fw} height={boxH} rx={5} fill={c.fill} opacity={0.85} />
              <text x={x + fw / 2} y={yBot + 22} textAnchor="middle" fontSize={18} fontWeight={700} fill={c.text}>
                {f.type}
              </text>
              <text x={x + fw / 2} y={yBot + 40} textAnchor="middle" fontSize={9.5} fill={c.text} fontFamily="ui-monospace, monospace">
                PTS={f.pts}
              </text>
            </g>
          )
        })}

      {/* Connecting lines: each frame at delivery position i goes to display position = f.pts */}
      {frames.map((f, i) => {
        const xFrom = xStart + i * (fw + fg) + fw / 2
        const xTo = xStart + f.pts * (fw + fg) + fw / 2
        return (
          <path
            key={`l-${i}`}
            d={`M ${xFrom} ${yTop + boxH} C ${xFrom} ${(yTop + yBot) / 2}, ${xTo} ${(yTop + yBot) / 2}, ${xTo} ${yBot}`}
            stroke={f.type === 'I' ? '#22d3ee' : f.type === 'P' ? '#1d4ed8' : '#475569'}
            strokeWidth={1.2}
            fill="none"
            opacity={0.55}
            strokeDasharray={f.type === 'B' ? '3 3' : undefined}
          />
        )
      })}

      {/* Footer */}
      <rect x={36} y={266} width={648} height={32} rx={4} fill="#0f172a" stroke="#334155" />
      <text x={360} y={282} textAnchor="middle" fontSize={10.5} fontWeight={700} fill="#94a3b8" letterSpacing="0.08em">
        FOR I/P: DTS = PTS · FOR B: PTS &gt; DTS (decoded before, shown after)
      </text>
      <text x={360} y={294} textAnchor="middle" fontSize={9.5} fill="#64748b">
        the container (MP4 / MPEG-TS / CMAF) stores both timestamps per sample
      </text>
    </svg>
  )
}
