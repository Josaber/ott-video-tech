import { ArrowMarker } from './_shared'

// ---------------------------------------------------------------------------
// Trick-play — main playlist and I-frame playlist sharing the same segments
// ---------------------------------------------------------------------------
export function TrickPlayFigure() {
  const segmentCount = 6
  const segW = 92
  const segGap = 8
  const xStart = (720 - (segmentCount * segW + (segmentCount - 1) * segGap)) / 2

  return (
    <svg
      viewBox="0 0 720 332"
      width="100%"
      role="img"
      aria-label="Trick-play I-frame playlist parallels the main playlist"
      style={{ display: 'block', maxWidth: '100%' }}
    >
      <defs>
        <ArrowMarker id="tp-arrow" />
      </defs>

      {/* MAIN PLAYLIST row */}
      <text x={36} y={32} fontSize={10.5} fontWeight={700} fill="#22d3ee" letterSpacing="0.1em">
        MAIN PLAYLIST · #EXT-X-STREAM-INF
      </text>
      <text x={684} y={32} textAnchor="end" fontSize={9.5} fill="#64748b">
        every frame in order
      </text>

      {Array.from({ length: segmentCount }).map((_, i) => {
        const x = xStart + i * (segW + segGap)
        return (
          <g key={`main-${i}`}>
            <rect x={x} y={42} width={segW} height={44} rx={4} fill="#1e293b" stroke="#22d3ee" />
            {/* Frames inside the segment: I P B B P B B P (8 frames, ~10px each) */}
            {['I', 'P', 'B', 'B', 'P', 'B', 'B', 'P'].map((t, fi) => {
              const fx = x + 4 + fi * 11
              const accent = t === 'I' ? '#22d3ee' : t === 'P' ? '#1d4ed8' : '#475569'
              return (
                <g key={fi}>
                  <rect x={fx} y={48} width={10} height={20} rx={1.5} fill={accent} opacity={t === 'I' ? 1 : 0.85} />
                  <text x={fx + 5} y={62} textAnchor="middle" fontSize={8.5} fontWeight={700} fill={t === 'I' ? '#0f172a' : '#f1f5f9'}>
                    {t}
                  </text>
                </g>
              )
            })}
            <text x={x + segW / 2} y={80} textAnchor="middle" fontSize={9} fill="#94a3b8" fontFamily="ui-monospace, monospace">
              segment_{String(i).padStart(3, '0')}.ts
            </text>
          </g>
        )
      })}

      {/* Shared .ts strip in the middle */}
      <text x={36} y={120} fontSize={10.5} fontWeight={700} fill="#94a3b8" letterSpacing="0.1em">
        SAME .TS FILES ON DISK
      </text>
      {Array.from({ length: segmentCount }).map((_, i) => {
        const x = xStart + i * (segW + segGap)
        return (
          <g key={`disk-${i}`}>
            {/* Down arrow from main */}
            <line x1={x + segW / 2} y1={86} x2={x + segW / 2} y2={126} stroke="#475569" strokeWidth={1.2} markerEnd="url(#tp-arrow)" />
            <rect x={x} y={128} width={segW} height={32} rx={4} fill="#0f172a" stroke="#334155" />
            <text x={x + segW / 2} y={140} textAnchor="middle" fontSize={9.5} fontWeight={700} fill="#cbd5e1" fontFamily="ui-monospace, monospace">
              segment_{String(i).padStart(3, '0')}.ts
            </text>
            <text x={x + segW / 2} y={154} textAnchor="middle" fontSize={9} fill="#64748b">
              shared bytes
            </text>
            {/* Down arrow to I-frame */}
            <line x1={x + segW / 2} y1={160} x2={x + segW / 2} y2={196} stroke="#475569" strokeWidth={1.2} markerEnd="url(#tp-arrow)" />
          </g>
        )
      })}

      {/* I-FRAME PLAYLIST row */}
      <text x={36} y={216} fontSize={10.5} fontWeight={700} fill="#f59e0b" letterSpacing="0.1em">
        I-FRAME PLAYLIST · #EXT-X-I-FRAME-STREAM-INF
      </text>
      <text x={684} y={216} textAnchor="end" fontSize={9.5} fill="#64748b">
        keyframes only · BYTERANGE into the same .ts
      </text>

      {Array.from({ length: segmentCount }).map((_, i) => {
        const x = xStart + i * (segW + segGap)
        return (
          <g key={`iframe-${i}`}>
            <rect x={x} y={226} width={segW} height={36} rx={4} fill="#1e293b" stroke="#f59e0b" />
            {/* I-frame indicator on the left, byterange value centered on the
                right half — keeps both clear of each other and lets the
                row-level "BYTERANGE into the same .ts" annotation above
                serve as the tag explanation. */}
            <rect x={x + 6} y={232} width={12} height={20} rx={1.5} fill="#22d3ee" />
            <text x={x + 12} y={246} textAnchor="middle" fontSize={8.5} fontWeight={700} fill="#0f172a">I</text>
            <text x={x + segW / 2 + 14} y={248} textAnchor="middle" fontSize={10} fill="#94a3b8" fontFamily="ui-monospace, monospace">
              48000@0
            </text>
          </g>
        )
      })}

      {/* Footer caption */}
      <rect x={36} y={280} width={648} height={42} rx={4} fill="#0f172a" stroke="#334155" />
      <text x={360} y={297} textAnchor="middle" fontSize={10.5} fontWeight={700} fill="#94a3b8" letterSpacing="0.08em">
        TRICK-PLAY = SAME SEGMENTS · DIFFERENT INDEX
      </text>
      <text x={360} y={313} textAnchor="middle" fontSize={9.5} fill="#64748b">
        the I-frame playlist references just the keyframe byte ranges → 8× / 4× / 2× FF needs ~10% the bandwidth
      </text>
    </svg>
  )
}
