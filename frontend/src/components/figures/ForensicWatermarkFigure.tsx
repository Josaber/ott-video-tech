import { ArrowMarker } from './_shared'

// ---------------------------------------------------------------------------
// Forensic watermark — A/B variant sequence encoding a per-viewer ID
// ---------------------------------------------------------------------------
export function ForensicWatermarkFigure() {
  const segCount = 10
  const segW = 50
  const segGap = 8
  const xStart = (720 - (segCount * segW + (segCount - 1) * segGap)) / 2
  // 10-bit example viewer ID; per segment, 0 = pick A, 1 = pick B
  const bits = [0, 1, 1, 0, 0, 1, 0, 0, 1, 1]

  return (
    <svg
      viewBox="0 0 720 360"
      width="100%"
      role="img"
      aria-label="Forensic watermark A/B variant stitching"
      style={{ display: 'block', maxWidth: '100%' }}
    >
      <defs>
        <ArrowMarker id="wm-arrow" />
      </defs>

      {/* Variant A library */}
      <text x={36} y={32} fontSize={10.5} fontWeight={700} fill="#22d3ee" letterSpacing="0.1em">
        VARIANT A LIBRARY · bit shift +1 LSB
      </text>
      {Array.from({ length: segCount }).map((_, i) => {
        const x = xStart + i * (segW + segGap)
        return (
          <g key={`a-${i}`}>
            <rect x={x} y={42} width={segW} height={36} rx={4} fill="#1e293b" stroke="#22d3ee" />
            <text x={x + segW / 2} y={58} textAnchor="middle" fontSize={11} fontWeight={700} fill="#22d3ee" fontFamily="ui-monospace, monospace">
              {String(i).padStart(2, '0')}A
            </text>
            <text x={x + segW / 2} y={72} textAnchor="middle" fontSize={9} fill="#94a3b8">
              ts
            </text>
          </g>
        )
      })}

      {/* Variant B library */}
      <text x={36} y={106} fontSize={10.5} fontWeight={700} fill="#f59e0b" letterSpacing="0.1em">
        VARIANT B LIBRARY · bit shift -1 LSB
      </text>
      {Array.from({ length: segCount }).map((_, i) => {
        const x = xStart + i * (segW + segGap)
        return (
          <g key={`b-${i}`}>
            <rect x={x} y={116} width={segW} height={36} rx={4} fill="#1e293b" stroke="#f59e0b" />
            <text x={x + segW / 2} y={132} textAnchor="middle" fontSize={11} fontWeight={700} fill="#f59e0b" fontFamily="ui-monospace, monospace">
              {String(i).padStart(2, '0')}B
            </text>
            <text x={x + segW / 2} y={146} textAnchor="middle" fontSize={9} fill="#94a3b8">
              ts
            </text>
          </g>
        )
      })}

      {/* Selector arrows pulling A or B per position */}
      {bits.map((bit, i) => {
        const x = xStart + i * (segW + segGap) + segW / 2
        const sourceY = bit === 0 ? 78 : 152
        return (
          <line
            key={`sel-${i}`}
            x1={x}
            y1={sourceY + 2}
            x2={x}
            y2={206}
            stroke={bit === 0 ? '#22d3ee' : '#f59e0b'}
            strokeWidth={1.4}
            markerEnd="url(#wm-arrow)"
          />
        )
      })}

      {/* Per-viewer stitched playlist */}
      <text x={36} y={196} fontSize={10.5} fontWeight={700} fill="#e2e8f0" letterSpacing="0.1em">
        PER-VIEWER MANIFEST · stitched at playback time
      </text>
      {bits.map((bit, i) => {
        const x = xStart + i * (segW + segGap)
        const accent = bit === 0 ? '#22d3ee' : '#f59e0b'
        return (
          <g key={`sel-${i}-stitched`}>
            <rect x={x} y={208} width={segW} height={44} rx={4} fill="#1e293b" stroke={accent} strokeWidth={1.5} />
            <text x={x + segW / 2} y={224} textAnchor="middle" fontSize={11} fontWeight={700} fill={accent} fontFamily="ui-monospace, monospace">
              {String(i).padStart(2, '0')}{bit === 0 ? 'A' : 'B'}
            </text>
            <text x={x + segW / 2} y={244} textAnchor="middle" fontSize={11} fontWeight={700} fill="#cbd5e1" fontFamily="ui-monospace, monospace">
              {bit}
            </text>
          </g>
        )
      })}

      {/* Bit string + ID decoded */}
      <rect x={36} y={266} width={648} height={32} rx={4} fill="#0f172a" stroke="#334155" />
      <text x={48} y={286} fontSize={10.5} fontWeight={700} fill="#94a3b8" letterSpacing="0.08em">
        VIEWER ID =
      </text>
      <text x={156} y={286} fontSize={11.5} fontWeight={700} fill="#22d3ee" fontFamily="ui-monospace, monospace" letterSpacing="0.16em">
        {bits.join('')}
      </text>
      <text x={344} y={286} fontSize={11} fill="#cbd5e1" fontFamily="ui-monospace, monospace">
        = 0x{parseInt(bits.join(''), 2).toString(16).toUpperCase().padStart(3, '0')} = decimal {parseInt(bits.join(''), 2)}
      </text>

      {/* Footer */}
      <text x={360} y={324} textAnchor="middle" fontSize={10.5} fontWeight={700} fill="#94a3b8" letterSpacing="0.08em">
        ~30 SEGMENTS · ENOUGH FOR 1 BILLION UNIQUE VIEWERS
      </text>
      <text x={360} y={342} textAnchor="middle" fontSize={9.5} fill="#64748b">
        leaked screen-capture → run forensic detector → recover bit sequence → look up account
      </text>
    </svg>
  )
}
