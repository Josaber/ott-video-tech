// ---------------------------------------------------------------------------
// Container vs codec — outer wrapper holding video / audio / subtitle tracks
// ---------------------------------------------------------------------------
export function ContainerStructureFigure() {
  const tracks = [
    { label: 'VIDEO TRACK',     codec: 'H.264 / AVC', detail: '1920×1080 · 5 Mbps' },
    { label: 'AUDIO TRACK',     codec: 'AAC',         detail: 'stereo · 192 kbps' },
    { label: 'SUBTITLE TRACK',  codec: 'WebVTT',      detail: 'language: en' },
  ]
  const trackW = 168
  const trackGap = 16
  const trackY = 80
  const trackH = 110
  const totalTracks = tracks.length * trackW + (tracks.length - 1) * trackGap

  // Container outer rect spans from 40 to 680 (width 640)
  const containerX = 40
  const containerY = 24
  const containerW = 640
  const containerH = 240
  const tracksStartX = containerX + (containerW - totalTracks - 100) / 2

  return (
    <svg
      viewBox="0 0 720 332"
      width="100%"
      role="img"
      aria-label="Container holds codec-encoded tracks"
      style={{ display: 'block', maxWidth: '100%' }}
    >
      {/* Outer container */}
      <rect
        x={containerX}
        y={containerY}
        width={containerW}
        height={containerH}
        rx={10}
        fill="#0f172a"
        stroke="#22d3ee"
        strokeWidth={1.5}
      />
      <text
        x={containerX + 16}
        y={containerY + 22}
        fontSize={11}
        fontWeight={700}
        fill="#22d3ee"
        letterSpacing="0.08em"
      >
        CONTAINER · .mp4 / .mkv / .mov / .ts / .m4s
      </text>
      <text x={containerX + 16} y={containerY + 38} fontSize={10} fill="#94a3b8">
        the wrapper format — does not specify how the streams inside are compressed
      </text>

      {/* Tracks */}
      {tracks.map((t, i) => {
        const x = tracksStartX + i * (trackW + trackGap)
        return (
          <g key={t.label}>
            <rect x={x} y={trackY} width={trackW} height={trackH} rx={6} fill="#1e293b" stroke="#334155" />
            <text x={x + trackW / 2} y={trackY + 22} textAnchor="middle" fontSize={11} fontWeight={700} fill="#e2e8f0" letterSpacing="0.06em">
              {t.label}
            </text>
            <text x={x + trackW / 2} y={trackY + 56} textAnchor="middle" fontSize={11} fontWeight={700} fill="#22d3ee" fontFamily="ui-monospace, monospace">
              {t.codec}
            </text>
            <text x={x + trackW / 2} y={trackY + 72} textAnchor="middle" fontSize={10} fill="#94a3b8">
              {t.detail}
            </text>
            <text x={x + trackW / 2} y={trackY + 96} textAnchor="middle" fontSize={9.5} fill="#64748b" letterSpacing="0.06em">
              ENCODED BITSTREAM
            </text>
          </g>
        )
      })}

      {/* Metadata sidebar (the moov box / index) */}
      {(() => {
        const mx = tracksStartX + 3 * (trackW + trackGap)
        return (
          <g>
            <rect x={mx} y={trackY} width={84} height={trackH} rx={6} fill="#1e293b" stroke="#334155" strokeDasharray="4 3" />
            <text x={mx + 42} y={trackY + 24} textAnchor="middle" fontSize={10} fontWeight={700} fill="#94a3b8" letterSpacing="0.06em">
              INDEX
            </text>
            <text x={mx + 42} y={trackY + 42} textAnchor="middle" fontSize={10} fill="#cbd5e1" fontFamily="ui-monospace, monospace">moov</text>
            <text x={mx + 42} y={trackY + 58} textAnchor="middle" fontSize={10} fill="#cbd5e1" fontFamily="ui-monospace, monospace">mdat</text>
            <text x={mx + 42} y={trackY + 74} textAnchor="middle" fontSize={10} fill="#cbd5e1" fontFamily="ui-monospace, monospace">stbl</text>
            <text x={mx + 42} y={trackY + 96} textAnchor="middle" fontSize={9} fill="#64748b">
              sample tables
            </text>
          </g>
        )
      })()}

      {/* Footer caption */}
      <rect x={40} y={284} width={640} height={36} rx={4} fill="#0f172a" stroke="#334155" />
      <text x={360} y={300} textAnchor="middle" fontSize={10.5} fontWeight={700} fill="#94a3b8" letterSpacing="0.08em">
        SAME CONTAINER · MANY CODEC COMBINATIONS
      </text>
      <text x={360} y={314} textAnchor="middle" fontSize={9.5} fill="#64748b">
        .mp4 holds H.264 / HEVC / AV1 video; mismatch is why a file plays in VLC but not Safari
      </text>
    </svg>
  )
}
