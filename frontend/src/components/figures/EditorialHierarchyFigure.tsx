import { ArrowMarker } from './_shared'

// ---------------------------------------------------------------------------
// Editorial hierarchy — Brand → Program → Season → Episode → Asset
// ---------------------------------------------------------------------------
export function EditorialHierarchyFigure() {
  const box = (x: number, y: number, w: number, h: number, label: string, sub: string, accent: string) => (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={6} fill="#1e293b" stroke={accent} />
      <text
        x={x + w / 2}
        y={y + 22}
        textAnchor="middle"
        fontSize={11}
        fontWeight={700}
        fill={accent}
        letterSpacing="0.06em"
      >
        {label}
      </text>
      <text x={x + w / 2} y={y + 40} textAnchor="middle" fontSize={10} fill="#94a3b8">
        {sub}
      </text>
    </g>
  )

  return (
    <svg
      viewBox="0 0 720 432"
      width="100%"
      role="img"
      aria-label="Editorial catalog hierarchy"
      style={{ display: 'block', maxWidth: '100%' }}
    >
      <defs>
        <ArrowMarker id="eh-arrow" />
      </defs>

      {/* Brand */}
      {box(280, 14, 160, 52, 'BRAND', '"Marvel"', '#22d3ee')}

      {/* Branches from Brand */}
      <line
        x1={320}
        y1={66}
        x2={170}
        y2={100}
        stroke="#475569"
        strokeWidth={1.5}
        markerEnd="url(#eh-arrow)"
      />
      <line
        x1={400}
        y1={66}
        x2={550}
        y2={100}
        stroke="#475569"
        strokeWidth={1.5}
        markerEnd="url(#eh-arrow)"
      />

      {/* Two programs */}
      {box(80, 102, 180, 52, 'PROGRAM · MOVIE', '"Iron Man"', '#e2e8f0')}
      {box(460, 102, 180, 52, 'PROGRAM · SERIES', '"Loki"', '#e2e8f0')}

      {/* Movie branch — direct to Asset (no Season / Episode) */}
      <line
        x1={170}
        y1={154}
        x2={170}
        y2={186}
        stroke="#475569"
        strokeWidth={1.5}
        markerEnd="url(#eh-arrow)"
      />
      {box(80, 188, 180, 52, 'ASSET · DELIVERABLE', 'theatrical · 4K HDR · Atmos', '#f59e0b')}

      {/* Note in the empty space below the movie branch explaining the short
          path: movies don't have Season or Episode level. */}
      <text x={170} y={296} textAnchor="middle" fontSize={10.5} fill="#64748b" fontStyle="italic">
        Movies stop here —
      </text>
      <text x={170} y={312} textAnchor="middle" fontSize={10.5} fill="#64748b" fontStyle="italic">
        no Season or Episode level.
      </text>

      {/* Series branch — Season → Episode → Asset */}
      <line
        x1={550}
        y1={154}
        x2={550}
        y2={186}
        stroke="#475569"
        strokeWidth={1.5}
        markerEnd="url(#eh-arrow)"
      />
      {box(460, 188, 180, 52, 'SEASON 1', '6 episodes', '#e2e8f0')}

      <line
        x1={550}
        y1={240}
        x2={550}
        y2={272}
        stroke="#475569"
        strokeWidth={1.5}
        markerEnd="url(#eh-arrow)"
      />
      {box(460, 274, 180, 52, 'EPISODE S01E03', '"Lamentis"', '#e2e8f0')}

      <line
        x1={550}
        y1={326}
        x2={550}
        y2={358}
        stroke="#475569"
        strokeWidth={1.5}
        markerEnd="url(#eh-arrow)"
      />
      {box(460, 360, 180, 52, 'ASSET · DELIVERABLE', '720p · stereo · en+es dub', '#f59e0b')}
    </svg>
  )
}
