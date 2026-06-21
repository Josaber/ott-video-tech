import { ArrowMarker } from './_shared'

// ---------------------------------------------------------------------------
// HLS — master → media playlists → segments
// ---------------------------------------------------------------------------
export function HLSManifestFigure() {
  return (
    <svg
      viewBox="0 0 720 332"
      width="100%"
      role="img"
      aria-label="HLS two-layer manifest"
      style={{ display: 'block', maxWidth: '100%' }}
    >
      <defs>
        <ArrowMarker id="hls-arrow" />
      </defs>

      {/* Master playlist */}
      <rect x={260} y={16} width={200} height={74} rx={6} fill="#1e293b" stroke="#22d3ee" strokeWidth={1.5} />
      <text x={360} y={36} textAnchor="middle" fontSize={11} fontWeight={700} fill="#22d3ee" letterSpacing="0.08em">
        MASTER PLAYLIST
      </text>
      <text x={360} y={52} textAnchor="middle" fontSize={10.5} fill="#cbd5e1" fontFamily="ui-monospace, monospace">
        master.m3u8
      </text>
      <text x={360} y={70} textAnchor="middle" fontSize={10} fill="#94a3b8">
        #EXT-X-STREAM-INF × N
      </text>

      {/* Three media playlists */}
      {[
        { x: 24, label: '1080p', subtitle: '5 Mbps' },
        { x: 264, label: '720p', subtitle: '2.4 Mbps' },
        { x: 504, label: '480p', subtitle: '1 Mbps' },
      ].map(({ x, label, subtitle }) => (
        <g key={label}>
          {/* Arrow from master into this media playlist */}
          <line
            x1={360}
            y1={90}
            x2={x + 96}
            y2={130}
            stroke="#475569"
            strokeWidth={1.5}
            markerEnd="url(#hls-arrow)"
          />
          <rect x={x} y={132} width={192} height={140} rx={6} fill="#1e293b" stroke="#334155" />
          <text x={x + 96} y={150} textAnchor="middle" fontSize={11} fontWeight={700} fill="#e2e8f0" letterSpacing="0.06em">
            MEDIA PLAYLIST
          </text>
          <text x={x + 96} y={166} textAnchor="middle" fontSize={11} fontWeight={700} fill="#22d3ee">
            {label}
          </text>
          <text x={x + 96} y={180} textAnchor="middle" fontSize={10} fill="#94a3b8">
            {subtitle}
          </text>
          <text x={x + 96} y={202} textAnchor="middle" fontSize={10} fill="#cbd5e1" fontFamily="ui-monospace, monospace">
            seg_000.ts
          </text>
          <text x={x + 96} y={216} textAnchor="middle" fontSize={10} fill="#cbd5e1" fontFamily="ui-monospace, monospace">
            seg_001.ts
          </text>
          <text x={x + 96} y={230} textAnchor="middle" fontSize={10} fill="#cbd5e1" fontFamily="ui-monospace, monospace">
            seg_002.ts
          </text>
          <text x={x + 96} y={246} textAnchor="middle" fontSize={11} fill="#64748b" fontFamily="ui-monospace, monospace">
            …
          </text>
          <text x={x + 96} y={262} textAnchor="middle" fontSize={9.5} fill="#64748b">
            #EXTINF segments
          </text>
          <line
            x1={x + 96}
            y1={272}
            x2={x + 96}
            y2={296}
            stroke="#475569"
            strokeWidth={1.5}
            markerEnd="url(#hls-arrow)"
          />
        </g>
      ))}

      {/* Segments strip */}
      <rect x={24} y={296} width={672} height={28} rx={4} fill="#0f172a" stroke="#334155" />
      <text x={360} y={314} textAnchor="middle" fontSize={11} fill="#64748b" letterSpacing="0.06em">
        BINARY SEGMENTS · MPEG-TS (.ts) or CMAF (.m4s) · 2–6 s each
      </text>
    </svg>
  )
}
