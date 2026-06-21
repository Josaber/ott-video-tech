// ---------------------------------------------------------------------------
// VMAF vs bitrate per resolution rung — shows the diminishing returns curve
// that per-title encoding uses to pick a ladder's "knee" bitrate.
// ---------------------------------------------------------------------------
export function VmafLadderFigure() {
  const W = 760
  const H = 460
  const padL = 76
  const padR = 36
  const padT = 92
  const padB = 80
  const innerW = W - padL - padR
  const innerH = H - padT - padB

  const minBR = 300
  const maxBR = 8000
  const minV = 50
  const maxV = 100

  const xOf = (br: number) =>
    padL + (Math.log(br / minBR) / Math.log(maxBR / minBR)) * innerW
  const yOf = (v: number) => padT + (1 - (v - minV) / (maxV - minV)) * innerH

  const rungs = [
    { label: '480p', k: 600, ceil: 92, color: '#22d3ee' },
    { label: '720p', k: 1200, ceil: 95, color: '#10b981' },
    { label: '1080p', k: 2500, ceil: 97, color: '#f59e0b' },
    { label: '2160p (4K)', k: 5000, ceil: 99, color: '#f43f5e' },
  ]

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      role="img"
      aria-label="VMAF score vs bitrate for four resolution rungs"
      style={{ display: 'block', maxWidth: '100%' }}
    >
      <rect x={0} y={0} width={W} height={H} fill="#0f172a" />

      {/* Header strip */}
      <text x={W / 2} y={30} textAnchor="middle" fontSize={14} fontWeight={700} fill="#f1f5f9" letterSpacing="0.06em">
        VMAF vs BITRATE — per resolution rung
      </text>

      {/* Legend row */}
      {rungs.map((r, i) => {
        const colW = 150
        const totalW = rungs.length * colW
        const startX = (W - totalW) / 2
        const cx = startX + i * colW
        return (
          <g key={`leg-${r.label}`}>
            <rect x={cx} y={48} width={16} height={16} fill={r.color} rx={3} />
            <text x={cx + 24} y={61} fontSize={13} fontWeight={600} fill="#f1f5f9">
              {r.label}
            </text>
          </g>
        )
      })}

      {/* Grid lines */}
      <g stroke="#1e293b" strokeWidth={1}>
        {[60, 70, 80, 90, 100].map((v) => (
          <line key={`hv-${v}`} x1={padL} y1={yOf(v)} x2={W - padR} y2={yOf(v)} />
        ))}
        {[500, 1000, 2000, 4000, 8000].map((br) => (
          <line key={`hb-${br}`} x1={xOf(br)} y1={padT} x2={xOf(br)} y2={H - padB} />
        ))}
      </g>

      {/* Axis tick labels */}
      {[500, 1000, 2000, 4000, 8000].map((br) => (
        <text
          key={`xt-${br}`}
          x={xOf(br)}
          y={H - padB + 20}
          textAnchor="middle"
          fontSize={12}
          fill="#cbd5e1"
        >
          {br}
        </text>
      ))}
      <text x={(W + padL - padR) / 2} y={H - padB + 46} fontSize={13} fontWeight={600} fill="#f1f5f9" textAnchor="middle">
        encoded bitrate (kbps, log scale)
      </text>
      {[60, 70, 80, 90, 100].map((v) => (
        <text key={`yt-${v}`} x={padL - 10} y={yOf(v) + 4} fontSize={12} fill="#cbd5e1" textAnchor="end">
          {v}
        </text>
      ))}
      <g transform={`translate(${padL - 52} ${(padT + H - padB) / 2}) rotate(-90)`}>
        <text fontSize={13} fontWeight={600} fill="#f1f5f9" textAnchor="middle">
          VMAF (0-100)
        </text>
      </g>

      {/* VMAF-90 reference dashed line (under curves) */}
      <line
        x1={padL}
        y1={yOf(90)}
        x2={W - padR}
        y2={yOf(90)}
        stroke="#f59e0b"
        strokeWidth={1.2}
        strokeDasharray="6 4"
      />

      {/* Curves */}
      {rungs.map((r) => {
        const pts: string[] = []
        for (let br = minBR; br <= maxBR; br *= 1.04) {
          const v = r.ceil - (r.ceil - minV) * Math.exp(-br / r.k)
          pts.push(`${xOf(br).toFixed(1)},${yOf(v).toFixed(1)}`)
        }
        return (
          <polyline
            key={`curve-${r.label}`}
            points={pts.join(' ')}
            fill="none"
            stroke={r.color}
            strokeWidth={2.2}
          />
        )
      })}

      {/* VMAF-90 callout — drawn AFTER curves so the box hides them under the label. */}
      <rect x={W - padR - 290} y={yOf(90) - 24} width={286} height={22} rx={4} fill="#0f172a" stroke="#f59e0b" strokeWidth={1.2} />
      <text
        x={W - padR - 12}
        y={yOf(90) - 9}
        fontSize={12}
        fontWeight={700}
        fill="#f59e0b"
        textAnchor="end"
      >
        VMAF 90 — "indistinguishable from source"
      </text>
    </svg>
  )
}
