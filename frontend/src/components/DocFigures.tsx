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
// GOP / I-P-B frame pattern
// ---------------------------------------------------------------------------
export function GOPFramesFigure() {
  // Pattern: I B B P B B P B B P B B  | I B B P
  // Two GOPs of 12 frames + 4 frames of GOP 3 = 16 frames shown.
  const pattern = ['I', 'B', 'B', 'P', 'B', 'B', 'P', 'B', 'B', 'P', 'B', 'B',
                   'I', 'B', 'B', 'P']
  const fw = 38
  const fg = 4
  const xStart = 40
  const yFrames = 60

  const color = (t: string) => {
    if (t === 'I') return { fill: '#22d3ee', text: '#0f172a', stroke: '#22d3ee' }
    if (t === 'P') return { fill: '#1d4ed8', text: '#f1f5f9', stroke: '#3b82f6' }
    return { fill: '#1e293b', text: '#94a3b8', stroke: '#334155' }
  }

  return (
    <svg
      viewBox="0 0 720 248"
      width="100%"
      role="img"
      aria-label="I, P and B frames within a GOP"
      style={{ display: 'block', maxWidth: '100%' }}
    >
      <defs>
        <ArrowMarker id="gop-arrow" />
      </defs>

      {/* Time axis */}
      <text x={40} y={28} fontSize={10} fill="#64748b" letterSpacing="0.1em">TIME →</text>
      <line x1={88} y1={24} x2={680} y2={24} stroke="#334155" strokeDasharray="2 3" />

      {/* Frames */}
      {pattern.map((t, i) => {
        const x = xStart + i * (fw + fg)
        const c = color(t)
        return (
          <g key={i}>
            <rect x={x} y={yFrames} width={fw} height={48} rx={4} fill={c.fill} stroke={c.stroke} />
            <text x={x + fw / 2} y={yFrames + 30} textAnchor="middle" fontSize={15} fontWeight={700} fill={c.text}>
              {t}
            </text>
            <text x={x + fw / 2} y={yFrames + 60} textAnchor="middle" fontSize={9} fill="#64748b">
              {i}
            </text>
          </g>
        )
      })}

      {/* GOP 1 bracket */}
      {(() => {
        const x1 = xStart
        const x2 = xStart + 12 * (fw + fg) - fg
        const by = yFrames + 78
        return (
          <g>
            <line x1={x1} y1={by} x2={x2} y2={by} stroke="#22d3ee" strokeWidth={1.5} />
            <line x1={x1} y1={by} x2={x1} y2={by - 6} stroke="#22d3ee" strokeWidth={1.5} />
            <line x1={x2} y1={by} x2={x2} y2={by - 6} stroke="#22d3ee" strokeWidth={1.5} />
            <text x={(x1 + x2) / 2} y={by + 16} textAnchor="middle" fontSize={11} fontWeight={700} fill="#22d3ee">
              GOP 1 · 12 frames · ~2–4 s
            </text>
          </g>
        )
      })()}

      {/* GOP 2 bracket (partial) */}
      {(() => {
        const x1 = xStart + 12 * (fw + fg)
        const x2 = xStart + 16 * (fw + fg) - fg
        const by = yFrames + 78
        return (
          <g>
            <line x1={x1} y1={by} x2={x2} y2={by} stroke="#94a3b8" strokeWidth={1.5} />
            <line x1={x1} y1={by} x2={x1} y2={by - 6} stroke="#94a3b8" strokeWidth={1.5} />
            <line x1={x2} y1={by} x2={x2} y2={by - 6} stroke="#94a3b8" strokeWidth={1.5} />
            <text x={(x1 + x2) / 2} y={by + 16} textAnchor="middle" fontSize={11} fontWeight={700} fill="#94a3b8">
              GOP 2 →
            </text>
          </g>
        )
      })()}

      {/* Callout: I-frame = segment boundary */}
      <g>
        <line
          x1={xStart + fw / 2}
          y1={yFrames - 6}
          x2={xStart + fw / 2}
          y2={yFrames - 24}
          stroke="#22d3ee"
          strokeWidth={1.5}
          markerStart="url(#gop-arrow)"
        />
        <text x={xStart + fw / 2 + 16} y={yFrames - 14} fontSize={10} fill="#22d3ee">
          I-frame = HLS segment boundary candidate
        </text>
      </g>

      {/* Legend */}
      <g transform="translate(40, 200)">
        <rect x={0} y={0} width={16} height={14} rx={3} fill="#22d3ee" />
        <text x={22} y={11} fontSize={10.5} fill="#cbd5e1">
          <tspan fontWeight={700}>I</tspan> · intra-coded, standalone
        </text>
        <rect x={196} y={0} width={16} height={14} rx={3} fill="#1d4ed8" />
        <text x={218} y={11} fontSize={10.5} fill="#cbd5e1">
          <tspan fontWeight={700}>P</tspan> · predicted from prior I/P
        </text>
        <rect x={416} y={0} width={16} height={14} rx={3} fill="#1e293b" stroke="#334155" />
        <text x={438} y={11} fontSize={10.5} fill="#cbd5e1">
          <tspan fontWeight={700}>B</tspan> · bidirectional, predicted from both sides
        </text>
      </g>
    </svg>
  )
}

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

// ---------------------------------------------------------------------------
// SSAI sequence — Player ↔ Backend ↔ Ad-Service
// ---------------------------------------------------------------------------
export function SSAISequenceFigure() {
  const lanes = [
    { x: 130, name: 'Player',     sub: 'hls.js + <video>' },
    { x: 360, name: 'Backend',    sub: 'manifest + license' },
    { x: 590, name: 'Ad-Service', sub: 'VAST + ad ts' },
  ]
  const steps: {
    y: number
    from: number
    to: number
    type?: 'self'
    label: string
    note?: string
  }[] = [
    { y: 92,  from: 0, to: 1, label: 'GET /playback/.../master.m3u8' },
    { y: 124, from: 1, to: 2, label: 'GET /vast?adId=preroll' },
    { y: 158, from: 2, to: 2, type: 'self', label: 'FFmpeg generate ad (cold ~48 s, then cached)' },
    { y: 192, from: 2, to: 1, label: 'VAST XML + ad manifest URL' },
    { y: 224, from: 1, to: 1, type: 'self', label: 'stitch ad segments + #EXT-X-DATERANGE' },
    { y: 258, from: 1, to: 0, label: 'stitched manifest + signed license URL' },
    { y: 290, from: 0, to: 2, label: 'GET ad ts (CORS, no Bearer)' },
    { y: 322, from: 0, to: 1, label: 'GET program ts + license.key (signed URL)' },
  ]

  return (
    <svg
      viewBox="0 0 720 360"
      width="100%"
      role="img"
      aria-label="SSAI manifest-stitching sequence"
      style={{ display: 'block', maxWidth: '100%' }}
    >
      <defs>
        <ArrowMarker id="ssai-arrow" color="#22d3ee" />
        <ArrowMarker id="ssai-arrow-amber" color="#f59e0b" />
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
              <rect x={lane.x - 130} y={step.y - 12} width={260} height={22} rx={4} fill="#0f172a" stroke="#475569" strokeDasharray="3 3" />
              <text x={lane.x} y={step.y + 3} textAnchor="middle" fontSize={10} fill="#cbd5e1">
                {step.label}
              </text>
            </g>
          )
        }
        const from = lanes[step.from]
        const to = lanes[step.to]
        const reverse = from.x > to.x
        const color = reverse ? '#f59e0b' : '#22d3ee'
        const marker = reverse ? 'url(#ssai-arrow-amber)' : 'url(#ssai-arrow)'
        return (
          <g key={i}>
            <line
              x1={from.x + (reverse ? -4 : 4)}
              y1={step.y}
              x2={to.x + (reverse ? 4 : -4)}
              y2={step.y}
              stroke={color}
              strokeWidth={1.5}
              markerEnd={marker}
            />
            <text x={(from.x + to.x) / 2} y={step.y - 6} textAnchor="middle" fontSize={10} fill={color}>
              {step.label}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Player browser stack — JS player / MSE / EME / HTMLMediaElement / Display
// ---------------------------------------------------------------------------
export function PlayerStackFigure() {
  return (
    <svg
      viewBox="0 0 720 360"
      width="100%"
      role="img"
      aria-label="Browser playback stack layers"
      style={{ display: 'block', maxWidth: '100%' }}
    >
      <defs>
        <ArrowMarker id="ps-arrow" />
        <ArrowMarker id="ps-arrow-amber" color="#f59e0b" />
      </defs>

      {/* JS Player */}
      <rect x={140} y={16} width={440} height={50} rx={6} fill="#1e293b" stroke="#22d3ee" strokeWidth={1.5} />
      <text x={360} y={36} textAnchor="middle" fontSize={11} fontWeight={700} fill="#22d3ee" letterSpacing="0.06em">
        JS PLAYER
      </text>
      <text x={360} y={54} textAnchor="middle" fontSize={10.5} fill="#94a3b8">
        hls.js · shaka-player · video.js · dash.js
      </text>

      {/* Arrows from JS Player to MSE and EME */}
      <line x1={250} y1={66} x2={210} y2={94} stroke="#475569" strokeWidth={1.5} markerEnd="url(#ps-arrow)" />
      <line x1={470} y1={66} x2={510} y2={94} stroke="#475569" strokeWidth={1.5} markerEnd="url(#ps-arrow)" />

      {/* MSE box */}
      <rect x={80} y={96} width={260} height={70} rx={6} fill="#1e293b" stroke="#334155" />
      <text x={210} y={116} textAnchor="middle" fontSize={11} fontWeight={700} fill="#e2e8f0" letterSpacing="0.06em">
        MSE
      </text>
      <text x={210} y={132} textAnchor="middle" fontSize={10} fill="#94a3b8">
        Media Source Extensions
      </text>
      <text x={210} y={150} textAnchor="middle" fontSize={9.5} fill="#cbd5e1">
        fetch segments → SourceBuffer.appendBuffer()
      </text>

      {/* EME box */}
      <rect x={380} y={96} width={260} height={70} rx={6} fill="#1e293b" stroke="#334155" />
      <text x={510} y={116} textAnchor="middle" fontSize={11} fontWeight={700} fill="#e2e8f0" letterSpacing="0.06em">
        EME
      </text>
      <text x={510} y={132} textAnchor="middle" fontSize={10} fill="#94a3b8">
        Encrypted Media Extensions
      </text>
      <text x={510} y={150} textAnchor="middle" fontSize={9.5} fill="#cbd5e1">
        requestMediaKeySystemAccess() → CDM
      </text>

      {/* Down arrows */}
      <line x1={210} y1={166} x2={300} y2={196} stroke="#475569" strokeWidth={1.5} markerEnd="url(#ps-arrow)" />
      <line x1={510} y1={166} x2={420} y2={196} stroke="#475569" strokeWidth={1.5} markerEnd="url(#ps-arrow)" />

      {/* HTMLMediaElement */}
      <rect x={140} y={198} width={440} height={64} rx={6} fill="#1e293b" stroke="#334155" />
      <text x={360} y={218} textAnchor="middle" fontSize={11} fontWeight={700} fill="#e2e8f0" letterSpacing="0.06em">
        HTMLMEDIAELEMENT
      </text>
      <text x={360} y={234} textAnchor="middle" fontSize={10} fill="#94a3b8">
        the &lt;video&gt; tag — demuxer + decoder + renderer
      </text>
      <text x={360} y={250} textAnchor="middle" fontSize={9.5} fill="#cbd5e1">
        events: timeupdate, waiting, error, ended
      </text>

      <line x1={360} y1={262} x2={360} y2={290} stroke="#475569" strokeWidth={1.5} markerEnd="url(#ps-arrow)" />

      {/* Display */}
      <rect x={240} y={292} width={240} height={36} rx={6} fill="#0f172a" stroke="#22d3ee" />
      <text x={360} y={314} textAnchor="middle" fontSize={11} fontWeight={700} fill="#22d3ee" letterSpacing="0.1em">
        DISPLAY · SPEAKER
      </text>

      {/* CDM side annotation */}
      <rect x={616} y={96} width={94} height={70} rx={6} fill="#1e293b" stroke="#f59e0b" strokeDasharray="4 3" />
      <text x={663} y={118} textAnchor="middle" fontSize={10.5} fontWeight={700} fill="#f59e0b">
        CDM
      </text>
      <text x={663} y={134} textAnchor="middle" fontSize={9.5} fill="#94a3b8">
        Widevine
      </text>
      <text x={663} y={148} textAnchor="middle" fontSize={9.5} fill="#94a3b8">
        FairPlay
      </text>
      <text x={663} y={162} textAnchor="middle" fontSize={9.5} fill="#94a3b8">
        PlayReady
      </text>
      <line x1={616} y1={131} x2={640} y2={131} stroke="#f59e0b" strokeWidth={1.5} markerStart="url(#ps-arrow-amber)" />

      <text x={663} y={186} textAnchor="middle" fontSize={9} fill="#64748b" fontStyle="italic">
        keys held in TEE
      </text>
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Editorial hierarchy — Brand → Program → Season → Episode → Asset
// ---------------------------------------------------------------------------
export function EditorialHierarchyFigure() {
  const box = (x: number, y: number, w: number, h: number, label: string, sub: string, accent: string, opts: { dashed?: boolean } = {}) => (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={6}
        fill="#1e293b"
        stroke={accent}
        strokeDasharray={opts.dashed ? '4 3' : undefined}
      />
      <text x={x + w / 2} y={y + 20} textAnchor="middle" fontSize={11} fontWeight={700} fill={accent} letterSpacing="0.06em">
        {label}
      </text>
      <text x={x + w / 2} y={y + 38} textAnchor="middle" fontSize={10} fill="#94a3b8">
        {sub}
      </text>
    </g>
  )

  return (
    <svg
      viewBox="0 0 720 380"
      width="100%"
      role="img"
      aria-label="Editorial catalog hierarchy"
      style={{ display: 'block', maxWidth: '100%' }}
    >
      <defs>
        <ArrowMarker id="eh-arrow" />
        <ArrowMarker id="eh-arrow-amber" color="#f59e0b" />
      </defs>

      {/* Brand */}
      {box(280, 14, 160, 50, 'BRAND', '"Marvel"', '#22d3ee')}

      {/* Branches from Brand */}
      <line x1={310} y1={64} x2={170} y2={94} stroke="#475569" strokeWidth={1.5} markerEnd="url(#eh-arrow)" />
      <line x1={410} y1={64} x2={550} y2={94} stroke="#475569" strokeWidth={1.5} markerEnd="url(#eh-arrow)" />

      {/* Two programs */}
      {box(80, 96, 180, 50, 'PROGRAM · MOVIE', '"Iron Man"', '#e2e8f0')}
      {box(460, 96, 180, 50, 'PROGRAM · SERIES', '"Loki"', '#e2e8f0')}

      {/* Movie branch → Asset directly */}
      <line x1={170} y1={146} x2={170} y2={176} stroke="#475569" strokeWidth={1.5} markerEnd="url(#eh-arrow)" />
      {box(80, 178, 180, 50, 'ASSET · DELIVERABLE', 'theatrical · 4K HDR · Atmos', '#f59e0b')}

      {/* Series branch → Season → Episode → Asset */}
      <line x1={550} y1={146} x2={550} y2={176} stroke="#475569" strokeWidth={1.5} markerEnd="url(#eh-arrow)" />
      {box(460, 178, 180, 50, 'SEASON 1', '6 episodes', '#e2e8f0')}

      <line x1={550} y1={228} x2={550} y2={258} stroke="#475569" strokeWidth={1.5} markerEnd="url(#eh-arrow)" />
      {box(460, 260, 180, 50, 'EPISODE S01E03', '"Lamentis"', '#e2e8f0')}

      <line x1={550} y1={310} x2={550} y2={340} stroke="#475569" strokeWidth={1.5} markerEnd="url(#eh-arrow)" />
      {box(460, 342, 180, 38, 'ASSET · DELIVERABLE', '720p · stereo · en+es dub', '#f59e0b')}

      {/* Collection (side, dashed) */}
      {box(304, 282, 152, 60, 'COLLECTION', 'curated · cross-cuts programs', '#94a3b8', { dashed: true })}
      <line x1={260} y1={302} x2={304} y2={302} stroke="#94a3b8" strokeWidth={1.2} strokeDasharray="4 3" />
      <line x1={456} y1={302} x2={500} y2={302} stroke="#94a3b8" strokeWidth={1.2} strokeDasharray="4 3" />
      <text x={380} y={358} textAnchor="middle" fontSize={9.5} fill="#64748b">
        e.g. "Marvel Origin Stories"
      </text>
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
