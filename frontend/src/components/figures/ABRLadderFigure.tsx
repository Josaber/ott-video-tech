import { ArrowMarker } from './_shared'

// ---------------------------------------------------------------------------
// ABR ladder — one mezzanine fan-out into many renditions
// ---------------------------------------------------------------------------
export function ABRLadderFigure() {
  const renditions = [
    { label: '240p',  codec: 'H.264', rate: '400 kbps', accent: '#475569' },
    { label: '360p',  codec: 'H.264', rate: '800 kbps', accent: '#3b82f6' },
    { label: '480p',  codec: 'H.264', rate: '1.4 Mbps', accent: '#2563eb' },
    { label: '720p',  codec: 'H.264', rate: '2.8 Mbps', accent: '#22d3ee' },
    { label: '1080p', codec: 'HEVC',  rate: '5 Mbps',   accent: '#10b981' },
    { label: '4K HDR',codec: 'HEVC',  rate: '12 Mbps',  accent: '#f59e0b' },
  ]
  const boxW = 96
  const gap = 16
  const total = renditions.length * boxW + (renditions.length - 1) * gap
  const xStart = (720 - total) / 2
  const yRow = 152
  const mezX = 260
  const mezY = 16

  return (
    <svg
      viewBox="0 0 720 290"
      width="100%"
      role="img"
      aria-label="ABR ladder fan-out from a mezzanine"
      style={{ display: 'block', maxWidth: '100%' }}
    >
      <defs>
        <ArrowMarker id="abr-arrow" />
      </defs>

      {/* Mezzanine */}
      <rect x={mezX} y={mezY} width={200} height={68} rx={6} fill="#1e293b" stroke="#22d3ee" strokeWidth={1.5} />
      <text x={mezX + 100} y={mezY + 22} textAnchor="middle" fontSize={11} fontWeight={700} fill="#22d3ee" letterSpacing="0.08em">
        MEZZANINE
      </text>
      <text x={mezX + 100} y={mezY + 40} textAnchor="middle" fontSize={11} fill="#cbd5e1">
        ProRes 422 HQ
      </text>
      <text x={mezX + 100} y={mezY + 56} textAnchor="middle" fontSize={10} fill="#94a3b8">
        1920×1080 · ~220 Mbps
      </text>

      {/* Fan-out arrows */}
      {renditions.map((_, i) => {
        const x = xStart + i * (boxW + gap) + boxW / 2
        return (
          <line
            key={i}
            x1={mezX + 100}
            y1={mezY + 68}
            x2={x}
            y2={yRow - 2}
            stroke="#475569"
            strokeWidth={1.3}
            markerEnd="url(#abr-arrow)"
          />
        )
      })}

      {/* Renditions */}
      {renditions.map((r, i) => {
        const x = xStart + i * (boxW + gap)
        return (
          <g key={r.label}>
            <rect x={x} y={yRow} width={boxW} height={88} rx={6} fill="#1e293b" stroke={r.accent} />
            <text x={x + boxW / 2} y={yRow + 26} textAnchor="middle" fontSize={13} fontWeight={700} fill={r.accent}>
              {r.label}
            </text>
            <text x={x + boxW / 2} y={yRow + 48} textAnchor="middle" fontSize={10.5} fill="#cbd5e1">
              {r.codec}
            </text>
            <text x={x + boxW / 2} y={yRow + 70} textAnchor="middle" fontSize={10} fill="#94a3b8">
              {r.rate}
            </text>
          </g>
        )
      })}

      {/* Bottom label */}
      <rect x={xStart} y={yRow + 100} width={total} height={26} rx={4} fill="#0f172a" stroke="#334155" />
      <text x={360} y={yRow + 117} textAnchor="middle" fontSize={11} fill="#64748b" letterSpacing="0.06em">
        ABR LADDER · keyframe-aligned · referenced from one master playlist
      </text>
    </svg>
  )
}
