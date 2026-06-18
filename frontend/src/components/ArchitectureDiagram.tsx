/**
 * Static SVG of the publishing pipeline so a new viewer can match the
 * frontend's job timeline to what's actually running on the backend.
 *
 * Box order matches the JobStage enum (UPLOAD → TRANSCODE → PACKAGE → SSAI
 * → DRM → PUBLISH). The Ad-Service branch hangs off SSAI because that's
 * the only stage that talks to a different process; everything else is
 * inside the backend's Temporal worker pool.
 */
export function ArchitectureDiagram() {
  const stages = [
    { key: 'UPLOAD',    desc: 'raw mp4 stored' },
    { key: 'TRANSCODE', desc: 'FFmpeg → ts' },
    { key: 'PACKAGE',   desc: 'HLS m3u8' },
    { key: 'SSAI',      desc: 'stitch ad' },
    { key: 'DRM',       desc: 'AES-128' },
    { key: 'PUBLISH',   desc: 'signed URLs' },
  ]
  const boxW = 124
  const boxH = 58
  const gap = 18
  const stagesY = 96
  const startX = 24

  return (
    <svg
      viewBox="0 0 880 282"
      width="100%"
      role="img"
      aria-label="OTT publishing pipeline architecture"
      style={{ display: 'block', maxWidth: '100%' }}
    >
      <defs>
        <marker
          id="arrow"
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#475569" />
        </marker>
        <marker
          id="arrow-amber"
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#f59e0b" />
        </marker>
      </defs>

      {/* Top banner: client */}
      <g>
        <rect x={24} y={16} width={832} height={28} rx={6} fill="#0f172a" stroke="#334155" />
        <text x={440} y={34} textAnchor="middle" fontSize={11} fill="#94a3b8" letterSpacing="0.08em">
          BROWSER  ·  Vite SPA  ·  hls.js player + admin console (Bearer JWT)
        </text>
      </g>

      {/* Pipeline boxes */}
      {stages.map((s, i) => {
        const x = startX + i * (boxW + gap)
        return (
          <g key={s.key}>
            <rect
              x={x}
              y={stagesY}
              width={boxW}
              height={boxH}
              rx={6}
              fill="#1e293b"
              stroke="#334155"
            />
            <text
              x={x + boxW / 2}
              y={stagesY + 23}
              textAnchor="middle"
              fontSize={12}
              fontWeight={700}
              fill="#22d3ee"
              letterSpacing="0.06em"
            >
              {s.key}
            </text>
            <text
              x={x + boxW / 2}
              y={stagesY + 42}
              textAnchor="middle"
              fontSize={10.5}
              fill="#94a3b8"
            >
              {s.desc}
            </text>
          </g>
        )
      })}

      {/* Arrows between stages */}
      {stages.slice(0, -1).map((_, i) => {
        const fromX = startX + i * (boxW + gap) + boxW
        const toX = startX + (i + 1) * (boxW + gap)
        const y = stagesY + boxH / 2
        return (
          <line
            key={i}
            x1={fromX + 2}
            y1={y}
            x2={toX - 2}
            y2={y}
            stroke="#475569"
            strokeWidth={1.5}
            markerEnd="url(#arrow)"
          />
        )
      })}

      {/* Arrow from browser banner down into UPLOAD */}
      <line
        x1={startX + boxW / 2}
        y1={44}
        x2={startX + boxW / 2}
        y2={stagesY - 2}
        stroke="#475569"
        strokeWidth={1.5}
        markerEnd="url(#arrow)"
      />
      <text x={startX + boxW / 2 + 10} y={70} fontSize={10} fill="#64748b">
        POST /upload
      </text>

      {/* Ad-service callout: above SSAI (index 3) */}
      {(() => {
        const ssaiX = startX + 3 * (boxW + gap)
        const ssaiCenter = ssaiX + boxW / 2
        const adX = ssaiX
        const adY = 180
        return (
          <g>
            <rect
              x={adX}
              y={adY}
              width={boxW}
              height={boxH}
              rx={6}
              fill="#1e293b"
              stroke="#f59e0b"
              strokeDasharray="4 3"
            />
            <text
              x={adX + boxW / 2}
              y={adY + 23}
              textAnchor="middle"
              fontSize={12}
              fontWeight={700}
              fill="#f59e0b"
              letterSpacing="0.06em"
            >
              AD-SERVICE
            </text>
            <text
              x={adX + boxW / 2}
              y={adY + 42}
              textAnchor="middle"
              fontSize={10.5}
              fill="#94a3b8"
            >
              VAST 4.2 + ad ts
            </text>
            <line
              x1={ssaiCenter}
              y1={stagesY + boxH + 2}
              x2={ssaiCenter}
              y2={adY - 2}
              stroke="#f59e0b"
              strokeWidth={1.5}
              strokeDasharray="4 3"
              markerEnd="url(#arrow-amber)"
              markerStart="url(#arrow-amber)"
            />
          </g>
        )
      })()}

      {/* Bottom: state stores — clear of the ad-service box, which ends at y=238 */}
      <g>
        <rect x={24} y={252} width={832} height={22} rx={4} fill="#0f172a" stroke="#334155" />
        <text x={440} y={267} textAnchor="middle" fontSize={10.5} fill="#64748b" letterSpacing="0.06em">
          STATE  ·  Temporal workflow (publish-&lt;assetId&gt;)  ·  PostgreSQL (jobs, assets, users)  ·  Filesystem (uploads, processed)
        </text>
      </g>
    </svg>
  )
}
