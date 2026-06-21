// ---------------------------------------------------------------------------
// Forensic watermarking — A/B variant encoding offline + runtime session
// stitching produce a per-viewer unique pattern that survives re-encoding.
// ---------------------------------------------------------------------------
export function WatermarkingFigure() {
  const W = 720
  const H = 320
  const segCount = 10
  const segW = 48
  const segH = 30
  const gap = 8
  const startX = (W - (segCount * segW + (segCount - 1) * gap)) / 2

  // Two unique session stitching patterns. 0 = variant A, 1 = variant B.
  const sessionA = [0, 1, 0, 1, 1, 0, 1, 0, 1, 0]
  const sessionB = [1, 0, 1, 0, 0, 1, 0, 1, 1, 1]

  const colA = '#22d3ee'
  const colB = '#f59e0b'

  const rowY = (i: number) => 60 + i * 64

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      role="img"
      aria-label="A/B variant watermark encoding plus per-session stitching"
      style={{ display: 'block', maxWidth: '100%' }}
    >
      <rect x={0} y={0} width={W} height={H} fill="#0f172a" />
      <text x={W / 2} y={26} textAnchor="middle" fontSize={11} fill="#94a3b8" letterSpacing="0.08em">
        OFFLINE A/B VARIANTS → RUNTIME PER-SESSION STITCH → UNIQUE LEAK FINGERPRINT
      </text>

      {[
        { label: 'variant A', color: colA, y: rowY(0) },
        { label: 'variant B', color: colB, y: rowY(1) },
      ].map((row) => (
        <g key={row.label}>
          <text x={startX - 14} y={row.y + 20} fontSize={11} fill={row.color} textAnchor="end" fontWeight={700}>
            {row.label}
          </text>
          {Array.from({ length: segCount }).map((_, i) => {
            const x = startX + i * (segW + gap)
            return (
              <rect key={i} x={x} y={row.y} width={segW} height={segH} rx={3} fill={row.color} fillOpacity={0.35} stroke={row.color} />
            )
          })}
        </g>
      ))}

      <text x={W / 2} y={rowY(2) + 4} textAnchor="middle" fontSize={10} fill="#94a3b8">
        Manifest service emits a per-viewer playlist that picks A or B per segment.
      </text>

      {[
        { label: 'viewer 3F2-A1', pattern: sessionA, y: rowY(2) + 22 },
        { label: 'viewer 9K7-B4', pattern: sessionB, y: rowY(3) + 22 },
      ].map((row) => (
        <g key={row.label}>
          <text x={startX - 14} y={row.y + 20} fontSize={11} fill="#cbd5e1" textAnchor="end">
            {row.label}
          </text>
          {row.pattern.map((v, i) => {
            const x = startX + i * (segW + gap)
            const c = v === 0 ? colA : colB
            return (
              <g key={i}>
                <rect x={x} y={row.y} width={segW} height={segH} rx={3} fill={c} fillOpacity={0.55} stroke={c} />
                <text x={x + segW / 2} y={row.y + 20} textAnchor="middle" fontSize={11} fontWeight={700} fill="#0f172a">
                  {v === 0 ? 'A' : 'B'}
                </text>
              </g>
            )
          })}
        </g>
      ))}
    </svg>
  )
}
