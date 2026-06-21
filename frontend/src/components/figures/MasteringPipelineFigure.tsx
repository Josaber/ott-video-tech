import { ArrowMarker } from './_shared'

// ---------------------------------------------------------------------------
// Mastering pipeline — capture → edit → color → mix → render → QC → mezzanine
// ---------------------------------------------------------------------------
export function MasteringPipelineFigure() {
  const stages = [
    { label: 'CAPTURE',     tool: 'camera · ARRI / RED',     accent: '#22d3ee' },
    { label: 'EDIT',        tool: 'Avid · Premiere · Resolve', accent: '#334155' },
    { label: 'COLOR GRADE', tool: 'DaVinci · Baselight',     accent: '#334155' },
    { label: 'AUDIO MIX',   tool: 'Pro Tools',                accent: '#334155' },
    { label: 'RENDER',      tool: 'NLE export',               accent: '#334155' },
    { label: 'QC',          tool: 'Aurora · Vidchecker · Baton', accent: '#334155' },
    { label: 'MEZZANINE',   tool: 'ProRes / IMF / DNxHR',     accent: '#f59e0b' },
    { label: 'INGEST',      tool: 'catalog · transcode',      accent: '#10b981' },
  ]
  const boxW = 82
  const gap = 8
  const total = stages.length * boxW + (stages.length - 1) * gap
  const xStart = (720 - total) / 2

  return (
    <svg
      viewBox="0 0 720 244"
      width="100%"
      role="img"
      aria-label="Mastering pipeline from capture to ingest"
      style={{ display: 'block', maxWidth: '100%' }}
    >
      <defs>
        <ArrowMarker id="mp-arrow" />
      </defs>

      {/* Top swimlane label */}
      <text x={36} y={30} fontSize={10.5} fontWeight={700} fill="#94a3b8" letterSpacing="0.12em">
        STUDIO / POST-HOUSE
      </text>
      <text x={684} y={30} textAnchor="end" fontSize={10.5} fontWeight={700} fill="#94a3b8" letterSpacing="0.12em">
        OTT PLATFORM
      </text>
      <line x1={36} y1={38} x2={684} y2={38} stroke="#334155" />

      {/* Stage boxes */}
      {stages.map((s, i) => {
        const x = xStart + i * (boxW + gap)
        const isLast = i === stages.length - 1
        return (
          <g key={s.label}>
            <rect x={x} y={66} width={boxW} height={92} rx={6} fill="#1e293b" stroke={s.accent} />
            <text x={x + boxW / 2} y={90} textAnchor="middle" fontSize={10} fontWeight={700} fill={s.accent === '#334155' ? '#e2e8f0' : s.accent} letterSpacing="0.06em">
              {s.label}
            </text>
            <foreignObject x={x + 4} y={100} width={boxW - 8} height={54}>
              <div
                style={{
                  fontSize: 9.5,
                  color: '#94a3b8',
                  textAlign: 'center',
                  lineHeight: 1.3,
                  fontFamily:
                    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                }}
              >
                {s.tool}
              </div>
            </foreignObject>
            {!isLast && (
              <line
                x1={x + boxW + 1}
                y1={112}
                x2={x + boxW + gap - 1}
                y2={112}
                stroke="#475569"
                strokeWidth={1.3}
                markerEnd="url(#mp-arrow)"
              />
            )}
          </g>
        )
      })}

      {/* Span markers for Studio vs OTT */}
      {(() => {
        const splitIdx = 6 // mezzanine handoff is between QC (5) and MEZZANINE (6)
        const splitX = xStart + splitIdx * (boxW + gap) - gap / 2
        return (
          <g>
            <line x1={splitX} y1={48} x2={splitX} y2={170} stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="4 3" />
            <rect x={splitX - 64} y={172} width={128} height={20} rx={4} fill="#0f172a" stroke="#f59e0b" />
            <text x={splitX} y={186} textAnchor="middle" fontSize={9.5} fontWeight={700} fill="#f59e0b" letterSpacing="0.08em">
              MEZZANINE HANDOFF
            </text>
          </g>
        )
      })()}

      {/* Footer caption */}
      <rect x={36} y={206} width={648} height={30} rx={4} fill="#0f172a" stroke="#334155" />
      <text x={360} y={222} textAnchor="middle" fontSize={10} fill="#64748b">
        weeks of studio work → one mezzanine file → seconds of platform ingest → days in the catalog
      </text>
    </svg>
  )
}
