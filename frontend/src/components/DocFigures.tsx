/**
 * SVG figures used inside Docs chapters. Each component returns a self-
 * contained inline SVG sized at 100% so the docs-figure wrapper controls
 * the actual width. Palette tracks the rest of the app:
 *   #1e293b panel · #334155 border · #22d3ee cyan accent · #f59e0b amber
 *   #475569 line · #e2e8f0 / #94a3b8 / #64748b text gradient
 */

function ArrowMarker({ id, color = '#475569' }: { id: string; color?: string }) {
  return (
    <marker
      id={id}
      viewBox="0 0 10 10"
      refX="9"
      refY="5"
      markerWidth="6"
      markerHeight="6"
      orient="auto-start-reverse"
    >
      <path d="M 0 0 L 10 5 L 0 10 z" fill={color} />
    </marker>
  )
}

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

// ---------------------------------------------------------------------------
// CDN — origin → shield → regional → edge → viewers
// ---------------------------------------------------------------------------
export function CDNCacheFigure() {
  return (
    <svg
      viewBox="0 0 720 360"
      width="100%"
      role="img"
      aria-label="CDN cache hierarchy"
      style={{ display: 'block', maxWidth: '100%' }}
    >
      <defs>
        <ArrowMarker id="cdn-arrow" />
      </defs>

      {/* Origin */}
      <rect x={280} y={14} width={160} height={42} rx={6} fill="#1e293b" stroke="#22d3ee" strokeWidth={1.5} />
      <text x={360} y={32} textAnchor="middle" fontSize={11} fontWeight={700} fill="#22d3ee" letterSpacing="0.08em">
        ORIGIN
      </text>
      <text x={360} y={48} textAnchor="middle" fontSize={10} fill="#94a3b8">
        your backend / packager
      </text>
      <line x1={360} y1={56} x2={360} y2={78} stroke="#475569" strokeWidth={1.5} markerEnd="url(#cdn-arrow)" />

      {/* Origin shield */}
      <rect x={264} y={80} width={192} height={42} rx={6} fill="#1e293b" stroke="#334155" />
      <text x={360} y={98} textAnchor="middle" fontSize={11} fontWeight={700} fill="#e2e8f0" letterSpacing="0.06em">
        ORIGIN SHIELD
      </text>
      <text x={360} y={114} textAnchor="middle" fontSize={10} fill="#94a3b8">
        single PoP, collapses concurrent misses
      </text>

      {/* Branches to tier-2 */}
      {[180, 360, 540].map((cx) => (
        <line
          key={cx}
          x1={360}
          y1={122}
          x2={cx}
          y2={144}
          stroke="#475569"
          strokeWidth={1.5}
          markerEnd="url(#cdn-arrow)"
        />
      ))}

      {/* Tier 2 — regional PoPs */}
      {[
        { x: 100, label: 'TIER-2 NA' },
        { x: 280, label: 'TIER-2 EU' },
        { x: 460, label: 'TIER-2 APAC' },
      ].map(({ x, label }) => (
        <g key={label}>
          <rect x={x} y={146} width={160} height={36} rx={6} fill="#1e293b" stroke="#334155" />
          <text x={x + 80} y={162} textAnchor="middle" fontSize={10.5} fontWeight={700} fill="#cbd5e1" letterSpacing="0.06em">
            {label}
          </text>
          <text x={x + 80} y={175} textAnchor="middle" fontSize={9.5} fill="#94a3b8">
            regional mid-tier cache
          </text>
        </g>
      ))}

      {/* Branches to edges (depict three under each tier-2; reuse a small set per column) */}
      {[180, 360, 540].map((cx) =>
        [-44, 0, 44].map((dx, j) => (
          <line
            key={`${cx}-${j}`}
            x1={cx}
            y1={182}
            x2={cx + dx}
            y2={210}
            stroke="#475569"
            strokeWidth={1.2}
            markerEnd="url(#cdn-arrow)"
          />
        )),
      )}

      {/* Edges */}
      {[180, 360, 540].map((cx) =>
        [-44, 0, 44].map((dx, j) => (
          <g key={`edge-${cx}-${j}`}>
            <rect
              x={cx + dx - 30}
              y={212}
              width={60}
              height={28}
              rx={4}
              fill="#1e293b"
              stroke="#334155"
            />
            <text x={cx + dx} y={224} textAnchor="middle" fontSize={9} fontWeight={700} fill="#94a3b8" letterSpacing="0.06em">
              EDGE
            </text>
            <text x={cx + dx} y={234} textAnchor="middle" fontSize={9} fill="#64748b">
              PoP
            </text>
          </g>
        )),
      )}

      {/* Branches to viewers */}
      {[180, 360, 540].map((cx) =>
        [-44, 0, 44].map((dx, j) => (
          <line
            key={`vline-${cx}-${j}`}
            x1={cx + dx}
            y1={240}
            x2={cx + dx}
            y2={270}
            stroke="#475569"
            strokeWidth={1.2}
            markerEnd="url(#cdn-arrow)"
          />
        )),
      )}

      {/* Viewer icons */}
      {[180, 360, 540].map((cx) =>
        [-44, 0, 44].map((dx, j) => (
          <g key={`viewer-${cx}-${j}`}>
            <circle cx={cx + dx} cy={282} r={6} fill="#0f172a" stroke="#f59e0b" strokeWidth={1.5} />
          </g>
        )),
      )}

      {/* Viewer band */}
      <rect x={40} y={300} width={640} height={42} rx={4} fill="#0f172a" stroke="#334155" />
      <text x={360} y={318} textAnchor="middle" fontSize={10.5} fontWeight={700} fill="#f59e0b" letterSpacing="0.08em">
        VIEWERS
      </text>
      <text x={360} y={334} textAnchor="middle" fontSize={10} fill="#94a3b8">
        cache hit at any tier short-circuits the path; only misses climb back up
      </text>
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Live latency budget — Classic HLS / LL-HLS / WebRTC horizontal bars
// ---------------------------------------------------------------------------
export function LiveLatencyFigure() {
  const totalWidthPx = 600
  const xStart = 92
  const usableWidth = totalWidthPx
  // Max scale: 23 s for visual; the bars represent the upper-bound budget
  const SCALE = usableWidth / 23

  type Slice = { label: string; sec: number; fill: string }
  type Row = { name: string; total: string; slices: Slice[] }

  const rows: Row[] = [
    {
      name: 'Classic HLS',
      total: '9–23 s',
      slices: [
        { label: 'GOP', sec: 4, fill: '#1e3a8a' },
        { label: 'contrib', sec: 2, fill: '#1d4ed8' },
        { label: 'pack', sec: 1, fill: '#2563eb' },
        { label: 'CDN', sec: 1, fill: '#3b82f6' },
        { label: 'player buffer', sec: 15, fill: '#60a5fa' },
      ],
    },
    {
      name: 'LL-HLS',
      total: '2–3 s',
      slices: [
        { label: 'partials', sec: 0.5, fill: '#065f46' },
        { label: 'block reload', sec: 0.5, fill: '#047857' },
        { label: 'CDN', sec: 0.5, fill: '#10b981' },
        { label: 'buffer', sec: 1.5, fill: '#34d399' },
      ],
    },
    {
      name: 'WebRTC',
      total: '~500 ms',
      slices: [
        { label: 'ingest', sec: 0.1, fill: '#7c2d12' },
        { label: 'forward', sec: 0.1, fill: '#9a3412' },
        { label: 'jitter buffer', sec: 0.3, fill: '#c2410c' },
      ],
    },
  ]

  return (
    <svg
      viewBox="0 0 720 268"
      width="100%"
      role="img"
      aria-label="Live latency budget"
      style={{ display: 'block', maxWidth: '100%' }}
    >
      {/* Axis */}
      <line x1={xStart} y1={232} x2={xStart + usableWidth} y2={232} stroke="#334155" />
      {[0, 5, 10, 15, 20].map((s) => {
        const x = xStart + s * SCALE
        return (
          <g key={s}>
            <line x1={x} y1={228} x2={x} y2={236} stroke="#334155" />
            <text x={x} y={250} textAnchor="middle" fontSize={10} fill="#64748b">
              {s}s
            </text>
          </g>
        )
      })}
      <text x={xStart + usableWidth / 2} y={262} textAnchor="middle" fontSize={9.5} fill="#475569" letterSpacing="0.08em">
        GLASS-TO-GLASS LATENCY
      </text>

      {rows.map((row, ri) => {
        const y = 30 + ri * 64
        let cursor = xStart
        return (
          <g key={row.name}>
            <text x={84} y={y + 18} textAnchor="end" fontSize={11.5} fontWeight={700} fill="#e2e8f0">
              {row.name}
            </text>
            <text x={84} y={y + 32} textAnchor="end" fontSize={10} fill="#94a3b8">
              {row.total}
            </text>

            {row.slices.map((slice, si) => {
              const w = slice.sec * SCALE
              const sx = cursor
              cursor += w
              const showInside = w > 50
              return (
                <g key={si}>
                  <rect x={sx} y={y} width={w} height={36} rx={3} fill={slice.fill} opacity={0.85} />
                  {showInside && (
                    <text
                      x={sx + w / 2}
                      y={y + 22}
                      textAnchor="middle"
                      fontSize={10}
                      fontWeight={600}
                      fill="#f1f5f9"
                    >
                      {slice.label}
                    </text>
                  )}
                </g>
              )
            })}
          </g>
        )
      })}
    </svg>
  )
}

// ---------------------------------------------------------------------------
// EME license sequence — Player ↔ License URL ↔ DRMaaS
// ---------------------------------------------------------------------------
export function EMELicenseSequenceFigure() {
  // Three lifelines
  const lanes = [
    { x: 130, name: 'Player', sub: 'browser + CDM' },
    { x: 360, name: 'License URL', sub: 'your platform' },
    { x: 590, name: 'DRMaaS', sub: 'Widevine / FairPlay / PlayReady' },
  ]
  // Sequence steps
  const steps = [
    { y: 92,  from: 0, to: 0, type: 'self', label: 'encrypted event → create MediaKeySession' },
    { y: 122, from: 0, to: 1, label: 'POST license request blob' },
    { y: 156, from: 1, to: 1, type: 'self', label: 'validate entitlement (sub, geo, HDCP, concurrent)' },
    { y: 190, from: 1, to: 2, label: 'forward blob' },
    { y: 220, from: 2, to: 2, type: 'self', label: 'wrap content key for this CDM' },
    { y: 254, from: 2, to: 1, label: 'license response blob' },
    { y: 286, from: 1, to: 0, label: 'license response' },
    { y: 318, from: 0, to: 0, type: 'self', label: 'session.update() → CDM decrypts in TEE' },
  ]

  return (
    <svg
      viewBox="0 0 720 360"
      width="100%"
      role="img"
      aria-label="EME license request sequence"
      style={{ display: 'block', maxWidth: '100%' }}
    >
      <defs>
        <ArrowMarker id="eme-arrow" color="#22d3ee" />
        <ArrowMarker id="eme-arrow-amber" color="#f59e0b" />
      </defs>

      {/* Lane headers */}
      {lanes.map((lane) => (
        <g key={lane.name}>
          <rect x={lane.x - 70} y={14} width={140} height={44} rx={6} fill="#1e293b" stroke="#334155" />
          <text x={lane.x} y={32} textAnchor="middle" fontSize={11.5} fontWeight={700} fill="#22d3ee" letterSpacing="0.06em">
            {lane.name.toUpperCase()}
          </text>
          <text x={lane.x} y={48} textAnchor="middle" fontSize={9.5} fill="#94a3b8">
            {lane.sub}
          </text>
        </g>
      ))}

      {/* Lifelines */}
      {lanes.map((lane) => (
        <line
          key={lane.x}
          x1={lane.x}
          y1={58}
          x2={lane.x}
          y2={350}
          stroke="#334155"
          strokeWidth={1}
          strokeDasharray="3 4"
        />
      ))}

      {/* Steps */}
      {steps.map((step, i) => {
        if (step.type === 'self') {
          const lane = lanes[step.from]
          return (
            <g key={i}>
              <rect x={lane.x - 100} y={step.y - 12} width={200} height={22} rx={4} fill="#0f172a" stroke="#475569" strokeDasharray="3 3" />
              <text x={lane.x} y={step.y + 3} textAnchor="middle" fontSize={10} fill="#cbd5e1">
                {step.label}
              </text>
            </g>
          )
        }
        const from = lanes[step.from]
        const to = lanes[step.to]
        const reverse = from.x > to.x
        const lineColor = reverse ? '#f59e0b' : '#22d3ee'
        const marker = reverse ? 'url(#eme-arrow-amber)' : 'url(#eme-arrow)'
        return (
          <g key={i}>
            <line
              x1={from.x + (reverse ? -4 : 4)}
              y1={step.y}
              x2={to.x + (reverse ? 4 : -4)}
              y2={step.y}
              stroke={lineColor}
              strokeWidth={1.5}
              markerEnd={marker}
            />
            <text x={(from.x + to.x) / 2} y={step.y - 6} textAnchor="middle" fontSize={10} fill={lineColor}>
              {step.label}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
