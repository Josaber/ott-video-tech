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

// ---------------------------------------------------------------------------
// Account → Profiles → Devices tree
// ---------------------------------------------------------------------------
export function AccountProfilesDevicesFigure() {
  const profiles = [
    { x: 80,  label: 'PROFILE · adult', sub: 'no maturity gate' },
    { x: 280, label: 'PROFILE · adult', sub: '"For Mom"' },
    { x: 480, label: 'PROFILE · kid',   sub: 'PG-13 max · no ads' },
  ]
  const devicesPerProfile = ['phone', 'TV', 'laptop']

  return (
    <svg
      viewBox="0 0 720 360"
      width="100%"
      role="img"
      aria-label="Account, profiles and devices hierarchy"
      style={{ display: 'block', maxWidth: '100%' }}
    >
      <defs>
        <ArrowMarker id="apd-arrow" />
      </defs>

      {/* Account */}
      <rect x={260} y={14} width={200} height={56} rx={6} fill="#1e293b" stroke="#22d3ee" strokeWidth={1.5} />
      <text x={360} y={34} textAnchor="middle" fontSize={11} fontWeight={700} fill="#22d3ee" letterSpacing="0.08em">ACCOUNT</text>
      <text x={360} y={50} textAnchor="middle" fontSize={10} fill="#cbd5e1">jane@example.com · Premium tier</text>
      <text x={360} y={64} textAnchor="middle" fontSize={9.5} fill="#94a3b8">billing · entitlement · region</text>

      {/* Lines from account to profiles */}
      {profiles.map((p) => (
        <line
          key={p.x}
          x1={360}
          y1={70}
          x2={p.x + 80}
          y2={106}
          stroke="#475569"
          strokeWidth={1.4}
          markerEnd="url(#apd-arrow)"
        />
      ))}

      {/* Profiles */}
      {profiles.map((p) => (
        <g key={p.label + p.x}>
          <rect x={p.x} y={108} width={160} height={56} rx={6} fill="#1e293b" stroke="#e2e8f0" />
          <text x={p.x + 80} y={128} textAnchor="middle" fontSize={11} fontWeight={700} fill="#e2e8f0" letterSpacing="0.06em">
            {p.label}
          </text>
          <text x={p.x + 80} y={144} textAnchor="middle" fontSize={9.5} fill="#94a3b8">{p.sub}</text>
          <text x={p.x + 80} y={158} textAnchor="middle" fontSize={9} fill="#64748b">history · queue · recs</text>
        </g>
      ))}

      {/* Lines from each profile down to device row */}
      {profiles.map((p) =>
        devicesPerProfile.map((_, i) => (
          <line
            key={`${p.x}-${i}`}
            x1={p.x + 80}
            y1={164}
            x2={p.x + 20 + i * 56}
            y2={206}
            stroke="#475569"
            strokeWidth={1.1}
            markerEnd="url(#apd-arrow)"
          />
        )),
      )}

      {/* Devices */}
      {profiles.map((p) =>
        devicesPerProfile.map((name, i) => (
          <g key={`dev-${p.x}-${i}`}>
            <rect x={p.x + i * 56} y={208} width={48} height={36} rx={4} fill="#1e293b" stroke="#f59e0b" />
            <text x={p.x + i * 56 + 24} y={224} textAnchor="middle" fontSize={9.5} fontWeight={700} fill="#f59e0b" letterSpacing="0.06em">
              DEVICE
            </text>
            <text x={p.x + i * 56 + 24} y={236} textAnchor="middle" fontSize={9} fill="#94a3b8">{name}</text>
          </g>
        )),
      )}

      {/* Caps note */}
      <rect x={60} y={272} width={600} height={66} rx={4} fill="#0f172a" stroke="#334155" />
      <text x={360} y={290} textAnchor="middle" fontSize={10.5} fontWeight={700} fill="#94a3b8" letterSpacing="0.08em">
        ENFORCED LIMITS
      </text>
      <text x={360} y={306} textAnchor="middle" fontSize={10} fill="#cbd5e1">
        max 5 profiles per account · 4 concurrent streams · ~10 registered devices
      </text>
      <text x={360} y={322} textAnchor="middle" fontSize={9.5} fill="#64748b">
        concurrency check happens at license-issue time, not at session start
      </text>
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Search & discovery — query pipeline
// ---------------------------------------------------------------------------
export function SearchPipelineFigure() {
  const stages = [
    { label: 'INPUT',       note: 'typed / voice' },
    { label: 'AUTOCOMPLETE', note: 'n-gram suggester' },
    { label: 'RETRIEVAL',   note: 'ES / Algolia' },
    { label: 'RERANK',      note: 'ML scoring' },
    { label: 'DIVERSIFY',   note: 'MMR / dedup' },
    { label: 'RENDER',      note: 'rail / grid' },
  ]
  const boxW = 96
  const gap = 12
  const total = stages.length * boxW + (stages.length - 1) * gap
  const xStart = (720 - total) / 2

  return (
    <svg
      viewBox="0 0 720 240"
      width="100%"
      role="img"
      aria-label="Search pipeline"
      style={{ display: 'block', maxWidth: '100%' }}
    >
      <defs>
        <ArrowMarker id="search-arrow" />
      </defs>

      {/* Stage boxes */}
      {stages.map((s, i) => {
        const x = xStart + i * (boxW + gap)
        const isFirst = i === 0
        const isLast = i === stages.length - 1
        const accent = isFirst ? '#22d3ee' : isLast ? '#10b981' : '#334155'
        return (
          <g key={s.label}>
            <rect x={x} y={70} width={boxW} height={84} rx={6} fill="#1e293b" stroke={accent} />
            <text x={x + boxW / 2} y={94} textAnchor="middle" fontSize={11} fontWeight={700} fill="#22d3ee" letterSpacing="0.06em">
              {s.label}
            </text>
            <text x={x + boxW / 2} y={112} textAnchor="middle" fontSize={10} fill="#94a3b8">
              {s.note}
            </text>
            {/* Step number */}
            <text x={x + boxW / 2} y={140} textAnchor="middle" fontSize={11} fontWeight={700} fill="#64748b" fontFamily="ui-monospace, monospace">
              {String(i + 1).padStart(2, '0')}
            </text>
          </g>
        )
      })}

      {/* Arrows between stages */}
      {stages.slice(0, -1).map((_, i) => {
        const fromX = xStart + i * (boxW + gap) + boxW
        const toX = xStart + (i + 1) * (boxW + gap)
        return (
          <line
            key={i}
            x1={fromX + 2}
            y1={112}
            x2={toX - 2}
            y2={112}
            stroke="#475569"
            strokeWidth={1.5}
            markerEnd="url(#search-arrow)"
          />
        )
      })}

      {/* Ranking-signals strip */}
      <rect x={xStart} y={176} width={total} height={42} rx={4} fill="#0f172a" stroke="#334155" />
      <text x={360} y={194} textAnchor="middle" fontSize={10.5} fontWeight={700} fill="#94a3b8" letterSpacing="0.08em">
        RANKING SIGNALS
      </text>
      <text x={360} y={210} textAnchor="middle" fontSize={10} fill="#cbd5e1">
        text match · popularity · recency · personalisation · regional availability · rights
      </text>

      {/* Top label */}
      <text x={360} y={36} textAnchor="middle" fontSize={10} fill="#64748b" letterSpacing="0.12em">
        QUERY · ~100 ms BUDGET
      </text>
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Subscription state machine
// ---------------------------------------------------------------------------
export function SubscriptionStateMachineFigure() {
  const states = {
    TRIAL:    { x: 88,  y: 50,  w: 140, h: 60, accent: '#22d3ee' },
    ACTIVE:   { x: 300, y: 50,  w: 140, h: 60, accent: '#10b981' },
    PAST_DUE: { x: 512, y: 150, w: 140, h: 60, accent: '#f59e0b' },
    DUNNING:  { x: 300, y: 250, w: 140, h: 60, accent: '#f97316' },
    CANCELED: { x: 88,  y: 250, w: 140, h: 60, accent: '#94a3b8' },
  } as const

  const transitions: { from: keyof typeof states; to: keyof typeof states; label: string; dx?: number; dy?: number }[] = [
    { from: 'TRIAL',    to: 'ACTIVE',   label: 'trial ends · charge ok' },
    { from: 'TRIAL',    to: 'CANCELED', label: 'user cancels' },
    { from: 'ACTIVE',   to: 'PAST_DUE', label: 'charge fails' },
    { from: 'ACTIVE',   to: 'CANCELED', label: 'user cancels' },
    { from: 'PAST_DUE', to: 'ACTIVE',   label: 'retry ok' },
    { from: 'PAST_DUE', to: 'DUNNING',  label: 'retry fails' },
    { from: 'DUNNING',  to: 'ACTIVE',   label: 'recovered' },
    { from: 'DUNNING',  to: 'CANCELED', label: 'max retries' },
    { from: 'CANCELED', to: 'ACTIVE',   label: 're-subscribe' },
  ]

  const center = (key: keyof typeof states) => {
    const s = states[key]
    return { cx: s.x + s.w / 2, cy: s.y + s.h / 2, s }
  }

  return (
    <svg
      viewBox="0 0 720 340"
      width="100%"
      role="img"
      aria-label="Subscription state machine"
      style={{ display: 'block', maxWidth: '100%' }}
    >
      <defs>
        <ArrowMarker id="sub-arrow" color="#475569" />
      </defs>

      {/* Transition lines (drawn before nodes so arrowheads land on box
          edges). Bidirectional pairs (ACTIVE↔PAST_DUE, ACTIVE↔CANCELED,
          DUNNING→ACTIVE etc.) would otherwise overlap at the same line
          position and their midpoint labels would stack on top of each
          other. Offset both line endpoints + label perpendicular to the
          line direction by 8 px — forward and reverse end up on parallel
          tracks with distinct label positions. */}
      {transitions.map((t, i) => {
        const a = center(t.from)
        const b = center(t.to)
        const dx = b.cx - a.cx
        const dy = b.cy - a.cy
        const len = Math.sqrt(dx * dx + dy * dy)
        const ux = dx / len
        const uy = dy / len
        // Approximate edge offset using half-width or half-height depending on dominant axis
        const inset = (s: typeof a.s) =>
          Math.abs(ux) * (s.w / 2) > Math.abs(uy) * (s.h / 2)
            ? s.w / 2 + 4
            : s.h / 2 + 4
        // Perpendicular unit vector (rotated 90° CW). Reversing the line
        // (b→a instead of a→b) flips (ux,uy) and therefore flips this
        // perpendicular too, so forward and reverse naturally land on
        // opposite sides.
        const perpX = -uy
        const perpY = ux
        const PARALLEL_OFFSET = 8
        const x1 = a.cx + ux * inset(a.s) + perpX * PARALLEL_OFFSET
        const y1 = a.cy + uy * inset(a.s) + perpY * PARALLEL_OFFSET
        const x2 = b.cx - ux * inset(b.s) + perpX * PARALLEL_OFFSET
        const y2 = b.cy - uy * inset(b.s) + perpY * PARALLEL_OFFSET
        const mx = (x1 + x2) / 2
        const my = (y1 + y2) / 2
        return (
          <g key={i}>
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#475569" strokeWidth={1.3} markerEnd="url(#sub-arrow)" />
            <rect x={mx - 58} y={my - 9} width={116} height={16} rx={3} fill="#0f172a" opacity={0.92} />
            <text x={mx} y={my + 3} textAnchor="middle" fontSize={9.5} fill="#cbd5e1">
              {t.label}
            </text>
          </g>
        )
      })}

      {/* States */}
      {(Object.keys(states) as (keyof typeof states)[]).map((key) => {
        const s = states[key]
        return (
          <g key={key}>
            <rect x={s.x} y={s.y} width={s.w} height={s.h} rx={8} fill="#1e293b" stroke={s.accent} strokeWidth={1.5} />
            <text x={s.x + s.w / 2} y={s.y + 30} textAnchor="middle" fontSize={13} fontWeight={700} fill={s.accent} letterSpacing="0.08em">
              {key}
            </text>
            <text x={s.x + s.w / 2} y={s.y + 48} textAnchor="middle" fontSize={9.5} fill="#94a3b8">
              {key === 'ACTIVE' ? 'plays everything' :
               key === 'TRIAL' ? 'plays · no charge yet' :
               key === 'PAST_DUE' ? 'plays · retry in progress' :
               key === 'DUNNING' ? 'plays · 7-day grace' :
               'access cut'}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Privacy & consent — TCF gate data flow
// ---------------------------------------------------------------------------
export function ConsentFlowFigure() {
  return (
    <svg
      viewBox="0 0 720 300"
      width="100%"
      role="img"
      aria-label="Consent flow and TCF gate"
      style={{ display: 'block', maxWidth: '100%' }}
    >
      <defs>
        <ArrowMarker id="cf-arrow" />
        <ArrowMarker id="cf-arrow-block" color="#dc2626" />
      </defs>

      {/* User */}
      <rect x={40} y={20} width={160} height={50} rx={6} fill="#1e293b" stroke="#22d3ee" />
      <text x={120} y={42} textAnchor="middle" fontSize={11} fontWeight={700} fill="#22d3ee" letterSpacing="0.08em">USER</text>
      <text x={120} y={58} textAnchor="middle" fontSize={10} fill="#94a3b8">first visit / new device</text>

      {/* CMP */}
      <line x1={200} y1={45} x2={262} y2={45} stroke="#475569" strokeWidth={1.5} markerEnd="url(#cf-arrow)" />
      <rect x={264} y={20} width={184} height={50} rx={6} fill="#1e293b" stroke="#f59e0b" />
      <text x={356} y={42} textAnchor="middle" fontSize={11} fontWeight={700} fill="#f59e0b" letterSpacing="0.08em">CMP</text>
      <text x={356} y={58} textAnchor="middle" fontSize={10} fill="#94a3b8">OneTrust / Sourcepoint / Didomi</text>

      {/* TCF string */}
      <line x1={448} y1={45} x2={510} y2={45} stroke="#475569" strokeWidth={1.5} markerEnd="url(#cf-arrow)" />
      <rect x={512} y={20} width={168} height={50} rx={6} fill="#0f172a" stroke="#22d3ee" />
      <text x={596} y={42} textAnchor="middle" fontSize={11} fontWeight={700} fill="#22d3ee" letterSpacing="0.06em" fontFamily="ui-monospace, monospace">
        TCF v2 STRING
      </text>
      <text x={596} y={58} textAnchor="middle" fontSize={9.5} fill="#94a3b8">
        CPFh3wA…  per-purpose flags
      </text>

      {/* Down to gates */}
      <line x1={596} y1={70} x2={596} y2={92} stroke="#475569" strokeWidth={1.5} markerEnd="url(#cf-arrow)" />
      <line x1={596} y1={92} x2={120} y2={92} stroke="#475569" strokeWidth={1.2} />
      <line x1={120} y1={92} x2={120} y2={110} stroke="#475569" strokeWidth={1.2} markerEnd="url(#cf-arrow)" />
      <line x1={336} y1={92} x2={336} y2={110} stroke="#475569" strokeWidth={1.2} markerEnd="url(#cf-arrow)" />
      <line x1={552} y1={92} x2={552} y2={110} stroke="#475569" strokeWidth={1.2} markerEnd="url(#cf-arrow)" />

      {/* Purpose gates */}
      {[
        { x: 40,  label: 'STORAGE',         note: 'localStorage, cookies' },
        { x: 256, label: 'ANALYTICS',       note: 'product telemetry' },
        { x: 472, label: 'TARGETED ADS',    note: 'IFA · retargeting' },
      ].map((g) => (
        <g key={g.label}>
          <rect x={g.x} y={112} width={160} height={50} rx={6} fill="#1e293b" stroke="#334155" />
          <text x={g.x + 80} y={132} textAnchor="middle" fontSize={11} fontWeight={700} fill="#e2e8f0" letterSpacing="0.06em">
            {g.label}
          </text>
          <text x={g.x + 80} y={148} textAnchor="middle" fontSize={9.5} fill="#94a3b8">{g.note}</text>
          <text x={g.x + 80} y={160} textAnchor="middle" fontSize={9} fill="#64748b">purpose gate</text>
        </g>
      ))}

      {/* Down to consumers (allow / block) */}
      <line x1={120} y1={162} x2={120} y2={206} stroke="#10b981" strokeWidth={1.5} markerEnd="url(#cf-arrow)" />
      <text x={132} y={186} fontSize={9.5} fill="#10b981">allow</text>
      <line x1={336} y1={162} x2={336} y2={206} stroke="#10b981" strokeWidth={1.5} markerEnd="url(#cf-arrow)" />
      <text x={348} y={186} fontSize={9.5} fill="#10b981">allow</text>
      <line x1={552} y1={162} x2={552} y2={206} stroke="#dc2626" strokeWidth={1.5} markerEnd="url(#cf-arrow-block)" strokeDasharray="4 3" />
      <text x={564} y={186} fontSize={9.5} fill="#dc2626">blocked</text>

      {/* Consumers */}
      {[
        { x: 40,  label: 'DB',           note: 'session, prefs' },
        { x: 256, label: 'ANALYTICS VENDOR', note: 'Mux, Mixpanel' },
        { x: 472, label: 'AD SERVER',     note: '— bidless' },
      ].map((c) => (
        <g key={c.label}>
          <rect x={c.x} y={208} width={160} height={42} rx={6} fill="#1e293b" stroke="#334155" />
          <text x={c.x + 80} y={226} textAnchor="middle" fontSize={10.5} fontWeight={700} fill="#cbd5e1" letterSpacing="0.06em">
            {c.label}
          </text>
          <text x={c.x + 80} y={242} textAnchor="middle" fontSize={9.5} fill="#94a3b8">{c.note}</text>
        </g>
      ))}

      {/* Footer */}
      <text x={360} y={278} textAnchor="middle" fontSize={10} fill="#64748b" letterSpacing="0.06em">
        EVERY DOWNSTREAM CONSUMER MUST READ THE TCF STRING BEFORE PROCESSING
      </text>
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Device platforms & SDKs
// ---------------------------------------------------------------------------
export function DevicePlatformsFigure() {
  type Leaf = { label: string; sub: string }
  const families: { name: string; x: number; accent: string; leaves: Leaf[] }[] = [
    {
      name: 'WEB',
      x: 40,
      accent: '#22d3ee',
      leaves: [
        { label: 'Browser', sub: 'hls.js / shaka' },
      ],
    },
    {
      name: 'MOBILE',
      x: 200,
      accent: '#3b82f6',
      leaves: [
        { label: 'iOS',     sub: 'AVPlayer · FairPlay' },
        { label: 'Android', sub: 'ExoPlayer · Widevine' },
      ],
    },
    {
      name: 'CTV',
      x: 360,
      accent: '#10b981',
      leaves: [
        { label: 'Apple TV', sub: 'AVPlayer · FairPlay' },
        { label: 'Roku',     sub: 'BrightScript SDK' },
        { label: 'Fire TV',  sub: 'Android · Widevine' },
        { label: 'Tizen',    sub: 'Samsung · PlayReady' },
        { label: 'webOS',    sub: 'LG · PlayReady' },
      ],
    },
    {
      name: 'CONSOLE',
      x: 560,
      accent: '#f59e0b',
      leaves: [
        { label: 'PlayStation', sub: 'Custom · PlayReady' },
        { label: 'Xbox',        sub: 'UWP · PlayReady' },
      ],
    },
  ]

  return (
    <svg
      viewBox="0 0 720 384"
      width="100%"
      role="img"
      aria-label="Device platforms tree"
      style={{ display: 'block', maxWidth: '100%' }}
    >
      <defs>
        <ArrowMarker id="dp-arrow" />
      </defs>

      {/* Root */}
      <rect x={280} y={14} width={160} height={50} rx={6} fill="#1e293b" stroke="#22d3ee" strokeWidth={1.5} />
      <text x={360} y={34} textAnchor="middle" fontSize={11} fontWeight={700} fill="#22d3ee" letterSpacing="0.08em">
        CATALOG API
      </text>
      <text x={360} y={50} textAnchor="middle" fontSize={10} fill="#94a3b8">
        one backend · many clients
      </text>

      {/* Family headers */}
      {families.map((f) => {
        const cx = f.x + 60
        return (
          <g key={f.name}>
            <line x1={360} y1={64} x2={cx} y2={94} stroke="#475569" strokeWidth={1.4} markerEnd="url(#dp-arrow)" />
            <rect x={f.x} y={96} width={120} height={40} rx={6} fill="#1e293b" stroke={f.accent} />
            <text x={cx} y={114} textAnchor="middle" fontSize={11} fontWeight={700} fill={f.accent} letterSpacing="0.08em">
              {f.name}
            </text>
            <text x={cx} y={128} textAnchor="middle" fontSize={9} fill="#94a3b8">
              {f.leaves.length} {f.leaves.length === 1 ? 'target' : 'targets'}
            </text>
          </g>
        )
      })}

      {/* Leaves */}
      {families.flatMap((f, fi) => {
        const cx = f.x + 60
        return f.leaves.map((leaf, li) => {
          const yBase = 156
          const ly = yBase + li * 38
          return (
            <g key={`${f.name}-${leaf.label}`}>
              <line x1={cx} y1={li === 0 ? 136 : ly - 8} x2={cx} y2={ly} stroke="#475569" strokeWidth={1.1} />
              <rect x={f.x} y={ly} width={120} height={32} rx={4} fill="#0f172a" stroke="#334155" />
              <text x={cx} y={ly + 14} textAnchor="middle" fontSize={10.5} fontWeight={700} fill="#cbd5e1">
                {leaf.label}
              </text>
              <text x={cx} y={ly + 26} textAnchor="middle" fontSize={9} fill="#94a3b8">
                {leaf.sub}
              </text>
            </g>
          )
        })
      })}

      {/* Footer: shared layer — pushed clear of the CTV column's last leaf
          (webOS at y=308–340) so the footer strip can't cover its border. */}
      <rect x={40} y={354} width={640} height={22} rx={4} fill="#0f172a" stroke="#334155" />
      <text x={360} y={369} textAnchor="middle" fontSize={10} fill="#64748b" letterSpacing="0.06em">
        SHARED · HLS / DASH manifests · CMAF segments · TCF string · entitlement service
      </text>
    </svg>
  )
}

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

// ---------------------------------------------------------------------------
// Codec efficiency — relative file size at equal visual quality
// ---------------------------------------------------------------------------
export function CodecEfficiencyFigure() {
  // Relative size at equal VMAF ~94. H.264 = 100, others scaled.
  const codecs = [
    { name: 'H.264 (AVC)',    year: 2003, sizePct: 100, accent: '#94a3b8' },
    { name: 'VP9',            year: 2013, sizePct: 65,  accent: '#3b82f6' },
    { name: 'H.265 (HEVC)',   year: 2013, sizePct: 50,  accent: '#22d3ee' },
    { name: 'AV1',            year: 2018, sizePct: 35,  accent: '#10b981' },
    { name: 'H.266 (VVC)',    year: 2020, sizePct: 30,  accent: '#f59e0b' },
  ]
  const labelW = 150
  const barXStart = 170
  const barMaxW = 420
  const rowH = 32
  const rowGap = 10
  const yStart = 56

  return (
    <svg
      viewBox="0 0 720 344"
      width="100%"
      role="img"
      aria-label="Codec efficiency comparison"
      style={{ display: 'block', maxWidth: '100%' }}
    >
      {/* Title row */}
      <text x={36} y={28} fontSize={10.5} fontWeight={700} fill="#94a3b8" letterSpacing="0.08em">
        CODEC
      </text>
      <text x={barXStart} y={28} fontSize={10.5} fontWeight={700} fill="#94a3b8" letterSpacing="0.08em">
        FILE SIZE AT EQUAL QUALITY (VMAF ~94)
      </text>
      <text x={650} y={28} textAnchor="end" fontSize={10.5} fontWeight={700} fill="#94a3b8" letterSpacing="0.08em">
        YEAR
      </text>

      {/* Reference grid lines */}
      {[0, 25, 50, 75, 100].map((pct) => {
        const x = barXStart + (pct / 100) * barMaxW
        return (
          <g key={pct}>
            <line x1={x} y1={42} x2={x} y2={yStart + codecs.length * (rowH + rowGap)} stroke="#1e293b" />
            <text x={x} y={yStart + codecs.length * (rowH + rowGap) + 14} textAnchor="middle" fontSize={9} fill="#64748b">
              {pct}%
            </text>
          </g>
        )
      })}

      {/* Bars */}
      {codecs.map((c, i) => {
        const y = yStart + i * (rowH + rowGap)
        const w = (c.sizePct / 100) * barMaxW
        return (
          <g key={c.name}>
            <text x={36} y={y + rowH / 2 + 4} fontSize={11} fontWeight={700} fill="#cbd5e1">
              {c.name}
            </text>
            <rect x={barXStart} y={y} width={barMaxW} height={rowH} rx={4} fill="#1e293b" stroke="#1e293b" />
            <rect x={barXStart} y={y} width={w} height={rowH} rx={4} fill={c.accent} opacity={0.85} />
            <text x={barXStart + w - 8} y={y + rowH / 2 + 4} textAnchor="end" fontSize={11} fontWeight={700} fill="#0f172a">
              {c.sizePct}%
            </text>
            <text x={650} y={y + rowH / 2 + 4} textAnchor="end" fontSize={10.5} fill="#94a3b8" fontFamily="ui-monospace, monospace">
              {c.year}
            </text>
          </g>
        )
      })}

      {/* Footer note — sits BELOW the % grid labels (which land at y=280
          for 5 rows). Earlier draft placed the rect at y=244 which clipped
          the VVC bar at y=224–256. */}
      <rect x={36} y={296} width={624} height={36} rx={4} fill="#0f172a" stroke="#334155" />
      <text x={348} y={312} textAnchor="middle" fontSize={10.5} fontWeight={700} fill="#94a3b8" letterSpacing="0.08em">
        EFFICIENCY GAINS ≠ ADOPTION
      </text>
      <text x={348} y={326} textAnchor="middle" fontSize={9.5} fill="#64748b">
        H.264 still dominates because hardware decode is universal · AV1 + VVC are limited by encode time and ecosystem support
      </text>
    </svg>
  )
}

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

// ---------------------------------------------------------------------------
// Catalog rail-based home page mock
// ---------------------------------------------------------------------------
export function HomeRailsFigure() {
  // Tile dimensions
  const tileW = 70
  const tileH = 42
  const tileGap = 10
  const railLabelH = 22
  const railHeight = railLabelH + tileH + 12
  const numTilesPerRail = 8

  const rails = [
    { name: 'CONTINUE WATCHING',    note: 'resume positions' },
    { name: 'BECAUSE YOU WATCHED…', note: 'content-based · per profile' },
    { name: 'TRENDING NOW',         note: 'global · recency-decayed' },
    { name: 'NEW RELEASES',         note: 'editorial' },
    { name: 'FOR YOU',              note: 'collaborative filtering' },
  ]

  // Hero banner area
  const heroH = 84

  return (
    <svg
      viewBox="0 0 720 580"
      width="100%"
      role="img"
      aria-label="Catalog home page rail layout"
      style={{ display: 'block', maxWidth: '100%' }}
    >
      {/* Phone / TV frame — 5 rails at y=168 + 76 each end at y=548, so
          frame bottom needs to be past that. */}
      <rect x={20} y={14} width={680} height={552} rx={10} fill="#0f172a" stroke="#334155" strokeWidth={1.5} />

      {/* Top nav */}
      <rect x={40} y={32} width={640} height={24} rx={4} fill="#1e293b" />
      <text x={56} y={48} fontSize={11} fontWeight={700} fill="#22d3ee" letterSpacing="0.08em">
        ★ STREAMR
      </text>
      <text x={296} y={48} fontSize={10} fill="#94a3b8" letterSpacing="0.06em">Home · Shows · Movies · My List</text>
      <circle cx={664} cy={44} r={7} fill="#1e293b" stroke="#475569" />

      {/* Hero banner */}
      <rect x={40} y={68} width={640} height={heroH} rx={6} fill="#1e293b" stroke="#22d3ee" strokeWidth={1.2} />
      <text x={60} y={90} fontSize={11} fontWeight={700} fill="#22d3ee" letterSpacing="0.08em">FEATURED</text>
      <text x={60} y={108} fontSize={14} fontWeight={700} fill="#e2e8f0">"The Last Lighthouse"</text>
      <text x={60} y={124} fontSize={10} fill="#94a3b8">a journey to the edge of the world — premieres Friday</text>
      <rect x={60} y={132} width={84} height={20} rx={4} fill="#22d3ee" />
      <text x={102} y={146} textAnchor="middle" fontSize={10} fontWeight={700} fill="#0f172a">▶ PLAY</text>
      <rect x={156} y={132} width={84} height={20} rx={4} fill="transparent" stroke="#475569" />
      <text x={198} y={146} textAnchor="middle" fontSize={10} fill="#cbd5e1">+ MY LIST</text>

      {/* Rails */}
      {rails.map((rail, ri) => {
        const yRail = 168 + ri * railHeight
        return (
          <g key={rail.name}>
            <text x={56} y={yRail + 12} fontSize={10} fontWeight={700} fill="#e2e8f0" letterSpacing="0.06em">
              {rail.name}
            </text>
            <text x={680} y={yRail + 12} textAnchor="end" fontSize={9} fill="#64748b" letterSpacing="0.04em">
              {rail.note}
            </text>
            {/* Tiles */}
            {Array.from({ length: numTilesPerRail }).map((_, ti) => {
              const x = 56 + ti * (tileW + tileGap)
              const isFocused = ri === 0 && ti === 0
              return (
                <g key={ti}>
                  <rect
                    x={x}
                    y={yRail + railLabelH}
                    width={tileW}
                    height={tileH}
                    rx={3}
                    fill="#1e293b"
                    stroke={isFocused ? '#22d3ee' : '#334155'}
                    strokeWidth={isFocused ? 2 : 1}
                  />
                  {/* Tiny decorative title bar */}
                  <line
                    x1={x + 6}
                    y1={yRail + railLabelH + tileH - 6}
                    x2={x + tileW - 6}
                    y2={yRail + railLabelH + tileH - 6}
                    stroke="#475569"
                    strokeWidth={1}
                  />
                </g>
              )
            })}
          </g>
        )
      })}

      {/* Focus annotation — below the last rail's tile row (y=560). */}
      <text x={56} y={560} fontSize={9.5} fill="#64748b" fontStyle="italic">
        rail order and tile order are personalised — the focused tile is the first decision the recommender makes
      </text>
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Auth & session — JWT issuance, refresh, token_version revocation
// ---------------------------------------------------------------------------
export function AuthRefreshFlowFigure() {
  const lanes = [
    { x: 130, name: 'Client',  sub: 'SPA · localStorage' },
    { x: 360, name: 'Backend', sub: 'Spring Security' },
    { x: 590, name: 'DB',      sub: 'Postgres · Caffeine cache' },
  ]
  const steps: {
    y: number
    from: number
    to: number
    type?: 'self'
    label: string
  }[] = [
    { y: 92,  from: 0, to: 1, label: 'POST /auth/login {user, pw}' },
    { y: 122, from: 1, to: 2, label: 'SELECT user, token_version' },
    { y: 152, from: 1, to: 0, label: 'access (15 m, tv=N) + refresh (24 h, tv=N)' },
    { y: 184, from: 0, to: 1, label: 'GET /api/... Bearer expired access' },
    { y: 208, from: 1, to: 1, type: 'self', label: 'EME-style 401: typ ok, exp failed' },
    { y: 232, from: 0, to: 1, label: 'POST /auth/refresh {refresh}' },
    { y: 256, from: 1, to: 2, label: 'check tv matches user.token_version' },
    { y: 286, from: 1, to: 0, label: 'fresh access + refresh, retry original' },
    { y: 316, from: 1, to: 2, type: 'self', label: 'change-password: UPDATE token_version = N+1' },
    { y: 346, from: 1, to: 0, label: 'tokens stamped tv=N+1 (caller stays signed in)' },
  ]

  return (
    <svg
      viewBox="0 0 720 384"
      width="100%"
      role="img"
      aria-label="JWT issue, refresh and token_version revocation"
      style={{ display: 'block', maxWidth: '100%' }}
    >
      <defs>
        <ArrowMarker id="auth-arrow" color="#22d3ee" />
        <ArrowMarker id="auth-arrow-amber" color="#f59e0b" />
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
          y2={372}
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
        const marker = reverse ? 'url(#auth-arrow-amber)' : 'url(#auth-arrow)'
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

// ---------------------------------------------------------------------------
// Audio sampling — continuous wave + discrete samples
// ---------------------------------------------------------------------------
export function AudioSamplingFigure() {
  const xStart = 60
  const xEnd = 660
  const yMid = 110
  const amp = 60
  const cycles = 2.5
  const numSamples = 20

  // Continuous wave path
  const wavePoints: string[] = []
  for (let i = 0; i <= 240; i++) {
    const x = xStart + (i / 240) * (xEnd - xStart)
    const phase = (i / 240) * cycles * 2 * Math.PI
    const y = yMid - amp * Math.sin(phase)
    wavePoints.push(`${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`)
  }

  // Discrete sample dots
  const samples: { x: number; y: number }[] = []
  for (let i = 0; i < numSamples; i++) {
    const x = xStart + (i / (numSamples - 1)) * (xEnd - xStart)
    const phase = (i / (numSamples - 1)) * cycles * 2 * Math.PI
    const y = yMid - amp * Math.sin(phase)
    samples.push({ x, y })
  }

  return (
    <svg
      viewBox="0 0 720 240"
      width="100%"
      role="img"
      aria-label="Audio sampling — continuous wave and discrete samples"
      style={{ display: 'block', maxWidth: '100%' }}
    >
      {/* Axis */}
      <line x1={xStart} y1={yMid} x2={xEnd} y2={yMid} stroke="#334155" strokeDasharray="3 4" />
      <text x={36} y={yMid + 4} fontSize={10} fill="#64748b">0</text>
      <text x={36} y={yMid - amp + 4} fontSize={10} fill="#64748b">+1</text>
      <text x={36} y={yMid + amp + 4} fontSize={10} fill="#64748b">−1</text>

      {/* Continuous wave */}
      <path d={wavePoints.join(' ')} stroke="#22d3ee" strokeWidth={1.5} fill="none" opacity={0.7} strokeDasharray="2 3" />

      {/* Sample sticks + dots */}
      {samples.map((p, i) => (
        <g key={i}>
          <line x1={p.x} y1={yMid} x2={p.x} y2={p.y} stroke="#f59e0b" strokeWidth={1} opacity={0.5} />
          <circle cx={p.x} cy={p.y} r={3.5} fill="#f59e0b" />
        </g>
      ))}

      {/* Labels */}
      <text x={xStart} y={28} fontSize={10.5} fontWeight={700} fill="#22d3ee" letterSpacing="0.08em">
        CONTINUOUS PRESSURE WAVE
      </text>
      <text x={xEnd} y={28} textAnchor="end" fontSize={10.5} fontWeight={700} fill="#f59e0b" letterSpacing="0.08em">
        DISCRETE SAMPLES · {numSamples} pts shown
      </text>

      {/* Footer caption */}
      <rect x={60} y={196} width={600} height={32} rx={4} fill="#0f172a" stroke="#334155" />
      <text x={360} y={212} textAnchor="middle" fontSize={10.5} fontWeight={700} fill="#94a3b8" letterSpacing="0.08em">
        SAMPLE RATE = SAMPLES / SECOND
      </text>
      <text x={360} y={224} textAnchor="middle" fontSize={9.5} fill="#64748b">
        Nyquist: must exceed 2× the highest frequency you want to preserve · 44.1 kHz covers 22 kHz, beyond audible
      </text>
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Chroma subsampling — 4:4:4 / 4:2:2 / 4:2:0 grids
// ---------------------------------------------------------------------------
export function ChromaSubsamplingFigure() {
  const cellSize = 30
  const gridCols = 4
  const gridRows = 4
  const gridWidth = cellSize * gridCols
  const gridHeight = cellSize * gridRows
  const gap = 60
  const xStart = (720 - (3 * gridWidth + 2 * gap)) / 2

  // For each format, decide which cells get chroma samples
  type Fmt = { name: string; sub: string; chromaPositions: [number, number][] }
  const allPositions: [number, number][] = []
  for (let r = 0; r < gridRows; r++) for (let c = 0; c < gridCols; c++) allPositions.push([r, c])
  const formats: Fmt[] = [
    {
      name: '4:4:4',
      sub: 'full chroma · mastering',
      chromaPositions: allPositions,
    },
    {
      name: '4:2:2',
      sub: 'half horizontal · broadcast',
      chromaPositions: allPositions.filter(([, c]) => c % 2 === 0),
    },
    {
      name: '4:2:0',
      sub: 'half horizontal + vertical · streaming default',
      chromaPositions: allPositions.filter(([r, c]) => r % 2 === 0 && c % 2 === 0),
    },
  ]

  return (
    <svg
      viewBox="0 0 720 260"
      width="100%"
      role="img"
      aria-label="Chroma subsampling 4:4:4 vs 4:2:2 vs 4:2:0"
      style={{ display: 'block', maxWidth: '100%' }}
    >
      {formats.map((fmt, fi) => {
        const x0 = xStart + fi * (gridWidth + gap)
        const y0 = 36
        return (
          <g key={fmt.name}>
            {/* Title */}
            <text x={x0 + gridWidth / 2} y={24} textAnchor="middle" fontSize={13} fontWeight={700} fill="#22d3ee" letterSpacing="0.06em">
              {fmt.name}
            </text>
            {/* Grid cells with luma dot */}
            {allPositions.map(([r, c]) => {
              const cx = x0 + c * cellSize + cellSize / 2
              const cy = y0 + r * cellSize + cellSize / 2
              return (
                <g key={`luma-${r}-${c}`}>
                  <rect x={x0 + c * cellSize} y={y0 + r * cellSize} width={cellSize} height={cellSize} fill="#1e293b" stroke="#334155" />
                  <circle cx={cx} cy={cy} r={3.5} fill="#e2e8f0" />
                </g>
              )
            })}
            {/* Chroma overlay */}
            {fmt.chromaPositions.map(([r, c]) => {
              const cx = x0 + c * cellSize + cellSize / 2
              const cy = y0 + r * cellSize + cellSize / 2
              return <circle key={`chroma-${r}-${c}`} cx={cx + 7} cy={cy - 6} r={3.5} fill="#f59e0b" />
            })}
            {/* Sub-label */}
            <text x={x0 + gridWidth / 2} y={y0 + gridHeight + 18} textAnchor="middle" fontSize={10} fill="#94a3b8">
              {fmt.sub}
            </text>
            <text x={x0 + gridWidth / 2} y={y0 + gridHeight + 32} textAnchor="middle" fontSize={9.5} fontWeight={700} fill="#cbd5e1" fontFamily="ui-monospace, monospace">
              {fmt.chromaPositions.length} / {gridRows * gridCols} chroma samples
            </text>
          </g>
        )
      })}

      {/* Legend */}
      <g transform="translate(60, 224)">
        <circle cx={6} cy={8} r={4} fill="#e2e8f0" />
        <text x={18} y={12} fontSize={10.5} fill="#cbd5e1">
          <tspan fontWeight={700}>luma</tspan> (Y · full grid in all modes)
        </text>
        <circle cx={266} cy={8} r={4} fill="#f59e0b" />
        <text x={278} y={12} fontSize={10.5} fill="#cbd5e1">
          <tspan fontWeight={700}>chroma</tspan> (Cb / Cr · subsampled)
        </text>
      </g>
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Gamut comparison — schematic CIE chromaticity with nested primary triangles
// ---------------------------------------------------------------------------
export function GamutFigure() {
  // Map CIE x in [0, 0.8] → SVG x in [60, 540]
  // Map CIE y in [0, 0.9] → SVG y in [340, 20] (inverted)
  const X0 = 60
  const X1 = 540
  const Y0 = 340
  const Y1 = 20
  const sx = (x: number) => X0 + (x / 0.8) * (X1 - X0)
  const sy = (y: number) => Y0 - (y / 0.9) * (Y0 - Y1)

  // Approximate CIE 1931 horseshoe with sampled points (wavelength → x,y)
  const horseshoe: [number, number][] = [
    [0.175, 0.005], [0.165, 0.018], [0.155, 0.030], [0.140, 0.045], [0.120, 0.060],
    [0.090, 0.100], [0.060, 0.180], [0.045, 0.260], [0.040, 0.354], [0.040, 0.500],
    [0.080, 0.700], [0.170, 0.800], [0.230, 0.825], [0.290, 0.815], [0.355, 0.785],
    [0.450, 0.500], [0.540, 0.450], [0.620, 0.380], [0.730, 0.265], [0.735, 0.265],
  ]
  const horseshoePoints = horseshoe.map(([x, y]) => `${sx(x).toFixed(1)},${sy(y).toFixed(1)}`).join(' ')

  // Color space primaries (CIE x,y)
  const spaces = [
    {
      name: 'sRGB / BT.709',
      accent: '#94a3b8',
      pts: [[0.64, 0.33], [0.30, 0.60], [0.15, 0.06]] as [number, number][],
    },
    {
      name: 'DCI-P3',
      accent: '#22d3ee',
      pts: [[0.68, 0.32], [0.265, 0.69], [0.15, 0.06]] as [number, number][],
    },
    {
      name: 'BT.2020',
      accent: '#f59e0b',
      pts: [[0.708, 0.292], [0.170, 0.797], [0.131, 0.046]] as [number, number][],
    },
  ]

  return (
    <svg
      viewBox="0 0 720 400"
      width="100%"
      role="img"
      aria-label="Color gamut comparison on the CIE 1931 chromaticity diagram"
      style={{ display: 'block', maxWidth: '100%' }}
    >
      {/* Title */}
      <text x={36} y={28} fontSize={10.5} fontWeight={700} fill="#94a3b8" letterSpacing="0.08em">
        CIE 1931 CHROMATICITY · schematic
      </text>

      {/* Horseshoe outline of visible colors */}
      <polygon points={horseshoePoints + ' ' + horseshoePoints.split(' ')[0]} fill="#0f172a" stroke="#475569" strokeWidth={1.2} />
      <text x={sx(0.4)} y={sy(0.05) + 4} textAnchor="middle" fontSize={9.5} fill="#64748b" fontStyle="italic">
        visible spectrum
      </text>

      {/* D65 white point */}
      <circle cx={sx(0.3127)} cy={sy(0.329)} r={4} fill="#e2e8f0" />
      <text x={sx(0.3127) + 10} y={sy(0.329) + 4} fontSize={10} fill="#cbd5e1">
        D65 white
      </text>

      {/* Color-space triangles */}
      {spaces.map((s) => {
        const pts = s.pts.map(([x, y]) => `${sx(x).toFixed(1)},${sy(y).toFixed(1)}`).join(' ')
        return (
          <g key={s.name}>
            <polygon points={pts} fill={s.accent} fillOpacity={0.08} stroke={s.accent} strokeWidth={1.6} />
          </g>
        )
      })}

      {/* Legend at right */}
      <g transform="translate(560, 60)">
        <text x={0} y={0} fontSize={10.5} fontWeight={700} fill="#94a3b8" letterSpacing="0.08em">
          GAMUT
        </text>
        {spaces.map((s, i) => (
          <g key={s.name} transform={`translate(0, ${24 + i * 36})`}>
            <rect x={0} y={0} width={20} height={14} rx={2} fill={s.accent} fillOpacity={0.35} stroke={s.accent} />
            <text x={28} y={11} fontSize={11} fontWeight={700} fill={s.accent}>
              {s.name}
            </text>
            <text x={28} y={24} fontSize={9.5} fill="#94a3b8">
              {i === 0 ? 'web · HD SDR' : i === 1 ? 'cinema · Apple' : 'UHD HDR'}
            </text>
          </g>
        ))}
      </g>

      {/* Footer caption */}
      <rect x={36} y={360} width={648} height={32} rx={4} fill="#0f172a" stroke="#334155" />
      <text x={360} y={376} textAnchor="middle" fontSize={10} fontWeight={700} fill="#94a3b8" letterSpacing="0.08em">
        EACH SPACE = 3 PRIMARIES + WHITE POINT → REPRODUCIBLE COLORS
      </text>
      <text x={360} y={388} textAnchor="middle" fontSize={9.5} fill="#64748b">
        outside the visible horseshoe is unreachable · larger triangle = more colors but harder display
      </text>
    </svg>
  )
}

// ---------------------------------------------------------------------------
// PTS vs DTS — delivery (decode) order vs display order
// ---------------------------------------------------------------------------
export function PtsDtsFigure() {
  // Frames in DELIVERY order. Each carries (DTS, PTS).
  // Equivalent display order: I B B P B B P  (positions 0-6)
  const frames = [
    { type: 'I', dts: 0, pts: 0 },
    { type: 'P', dts: 1, pts: 3 },
    { type: 'B', dts: 2, pts: 1 },
    { type: 'B', dts: 3, pts: 2 },
    { type: 'P', dts: 4, pts: 6 },
    { type: 'B', dts: 5, pts: 4 },
    { type: 'B', dts: 6, pts: 5 },
  ]
  const fw = 64
  const fg = 18
  const xStart = (720 - (frames.length * fw + (frames.length - 1) * fg)) / 2

  const color = (t: string) => {
    if (t === 'I') return { fill: '#22d3ee', text: '#0f172a' }
    if (t === 'P') return { fill: '#1d4ed8', text: '#f1f5f9' }
    return { fill: '#475569', text: '#f1f5f9' }
  }

  const yTop = 60
  const yBot = 200
  const boxH = 52

  return (
    <svg
      viewBox="0 0 720 304"
      width="100%"
      role="img"
      aria-label="DTS delivery order vs PTS display order"
      style={{ display: 'block', maxWidth: '100%' }}
    >
      {/* Row labels */}
      <text x={36} y={32} fontSize={10.5} fontWeight={700} fill="#22d3ee" letterSpacing="0.08em">
        DELIVERY ORDER · DTS — what the decoder receives
      </text>
      <text x={36} y={184} fontSize={10.5} fontWeight={700} fill="#f59e0b" letterSpacing="0.08em">
        DISPLAY ORDER · PTS — what the viewer sees
      </text>

      {/* Delivery row */}
      {frames.map((f, i) => {
        const x = xStart + i * (fw + fg)
        const c = color(f.type)
        return (
          <g key={`d-${i}`}>
            <rect x={x} y={yTop} width={fw} height={boxH} rx={5} fill={c.fill} />
            <text x={x + fw / 2} y={yTop + 22} textAnchor="middle" fontSize={18} fontWeight={700} fill={c.text}>
              {f.type}
            </text>
            <text x={x + fw / 2} y={yTop + 40} textAnchor="middle" fontSize={9.5} fill={c.text} fontFamily="ui-monospace, monospace">
              DTS={f.dts}
            </text>
            <text x={x + fw / 2} y={yTop - 6} textAnchor="middle" fontSize={9.5} fill="#94a3b8">
              PTS={f.pts}
            </text>
          </g>
        )
      })}

      {/* Display row — sort frames by PTS */}
      {[...frames]
        .sort((a, b) => a.pts - b.pts)
        .map((f, i) => {
          const x = xStart + i * (fw + fg)
          const c = color(f.type)
          return (
            <g key={`p-${i}`}>
              <rect x={x} y={yBot} width={fw} height={boxH} rx={5} fill={c.fill} opacity={0.85} />
              <text x={x + fw / 2} y={yBot + 22} textAnchor="middle" fontSize={18} fontWeight={700} fill={c.text}>
                {f.type}
              </text>
              <text x={x + fw / 2} y={yBot + 40} textAnchor="middle" fontSize={9.5} fill={c.text} fontFamily="ui-monospace, monospace">
                PTS={f.pts}
              </text>
            </g>
          )
        })}

      {/* Connecting lines: each frame at delivery position i goes to display position = f.pts */}
      {frames.map((f, i) => {
        const xFrom = xStart + i * (fw + fg) + fw / 2
        const xTo = xStart + f.pts * (fw + fg) + fw / 2
        return (
          <path
            key={`l-${i}`}
            d={`M ${xFrom} ${yTop + boxH} C ${xFrom} ${(yTop + yBot) / 2}, ${xTo} ${(yTop + yBot) / 2}, ${xTo} ${yBot}`}
            stroke={f.type === 'I' ? '#22d3ee' : f.type === 'P' ? '#1d4ed8' : '#475569'}
            strokeWidth={1.2}
            fill="none"
            opacity={0.55}
            strokeDasharray={f.type === 'B' ? '3 3' : undefined}
          />
        )
      })}

      {/* Footer */}
      <rect x={36} y={266} width={648} height={32} rx={4} fill="#0f172a" stroke="#334155" />
      <text x={360} y={282} textAnchor="middle" fontSize={10.5} fontWeight={700} fill="#94a3b8" letterSpacing="0.08em">
        FOR I/P: DTS = PTS · FOR B: PTS &gt; DTS (decoded before, shown after)
      </text>
      <text x={360} y={294} textAnchor="middle" fontSize={9.5} fill="#64748b">
        the container (MP4 / MPEG-TS / CMAF) stores both timestamps per sample
      </text>
    </svg>
  )
}

// ---------------------------------------------------------------------------
// HMAC signed-URL flow — sign on top, verify below
// ---------------------------------------------------------------------------
export function HmacFlowFigure() {
  // Two horizontal strips stacked. Sign strip: KEY + MSG converge into the
  // HMAC compute box, output TAG, then the assembled URL string. Verify
  // strip: URL arrives → recompute → constant-time compare.
  return (
    <svg
      viewBox="0 0 720 360"
      width="100%"
      role="img"
      aria-label="HMAC sign and verify flow"
      style={{ display: 'block', maxWidth: '100%' }}
    >
      <defs>
        <ArrowMarker id="hmac-arrow" color="#22d3ee" />
        <ArrowMarker id="hmac-arrow-amber" color="#f59e0b" />
      </defs>

      {/* ═══════════ ① SIGN STRIP ═══════════ */}
      <rect x={16} y={14} width={688} height={196} rx={8} fill="#0f172a" stroke="#22d3ee" strokeWidth={1.2} />
      <text x={36} y={36} fontSize={11} fontWeight={700} fill="#22d3ee" letterSpacing="0.1em">
        ① SIGN · server side
      </text>

      {/* KEY (top input) */}
      <rect x={40} y={56} width={150} height={42} rx={6} fill="#1e293b" stroke="#22d3ee" />
      <text x={115} y={74} textAnchor="middle" fontSize={11} fontWeight={700} fill="#22d3ee" letterSpacing="0.06em">KEY</text>
      <text x={115} y={88} textAnchor="middle" fontSize={9.5} fill="#94a3b8">secret · never sent</text>

      {/* MESSAGE (bottom input) */}
      <rect x={40} y={108} width={240} height={42} rx={6} fill="#1e293b" stroke="#334155" />
      <text x={160} y={126} textAnchor="middle" fontSize={11} fontWeight={700} fill="#e2e8f0" letterSpacing="0.06em">MESSAGE</text>
      <text x={160} y={140} textAnchor="middle" fontSize={9} fill="#94a3b8" fontFamily="ui-monospace, monospace">
        user=alice&exp=1781…
      </text>

      {/* HMAC compute box — sits to the right of both inputs */}
      <rect x={320} y={74} width={170} height={58} rx={6} fill="#0f172a" stroke="#22d3ee" strokeWidth={1.5} />
      <text x={405} y={96} textAnchor="middle" fontSize={12} fontWeight={700} fill="#22d3ee" letterSpacing="0.06em">HMAC-SHA256</text>
      <text x={405} y={114} textAnchor="middle" fontSize={9.5} fill="#94a3b8">key + message → tag</text>

      {/* Arrows from inputs into compute box */}
      <line x1={190} y1={77} x2={316} y2={92} stroke="#22d3ee" strokeWidth={1.5} markerEnd="url(#hmac-arrow)" />
      <line x1={280} y1={129} x2={316} y2={114} stroke="#22d3ee" strokeWidth={1.5} markerEnd="url(#hmac-arrow)" />

      {/* Arrow from compute → TAG */}
      <line x1={490} y1={103} x2={520} y2={103} stroke="#22d3ee" strokeWidth={1.5} markerEnd="url(#hmac-arrow)" />

      {/* TAG output */}
      <rect x={522} y={74} width={148} height={58} rx={6} fill="#1e293b" stroke="#22d3ee" />
      <text x={596} y={96} textAnchor="middle" fontSize={12} fontWeight={700} fill="#22d3ee" letterSpacing="0.06em">TAG</text>
      <text x={596} y={114} textAnchor="middle" fontSize={9.5} fill="#94a3b8" fontFamily="ui-monospace, monospace">32 bytes</text>

      {/* URL emitted (bottom of sign strip) */}
      <text x={40} y={172} fontSize={10} fontWeight={700} fill="#94a3b8" letterSpacing="0.08em">
        EMITTED URL
      </text>
      <rect x={40} y={178} width={630} height={22} rx={4} fill="#0f172a" stroke="#475569" />
      <text x={52} y={193} fontSize={10} fill="#cbd5e1" fontFamily="ui-monospace, monospace">
        license.key?user=alice&exp=1781…&nonce=…&sig=base64url(tag)
      </text>

      {/* ═══════════ ② VERIFY STRIP ═══════════ */}
      <rect x={16} y={224} width={688} height={102} rx={8} fill="#0f172a" stroke="#f59e0b" strokeWidth={1.2} />
      <text x={36} y={246} fontSize={11} fontWeight={700} fill="#f59e0b" letterSpacing="0.1em">
        ② VERIFY · receiver (same KEY held server-side)
      </text>

      {/* Three boxes horizontally — URL arrives → recompute → compare */}
      {[
        { x: 40,  label: 'URL ARRIVES',      note: 'extract message + tag' },
        { x: 256, label: 'RECOMPUTE HMAC',   note: '→ expected_tag' },
        { x: 472, label: 'CONSTANT-TIME ==', note: 'match → trust · else 403' },
      ].map((b, i) => (
        <g key={b.label}>
          <rect x={b.x} y={262} width={190} height={52} rx={6} fill="#1e293b" stroke="#f59e0b" strokeDasharray={i === 2 ? '4 3' : undefined} />
          <text x={b.x + 95} y={284} textAnchor="middle" fontSize={11} fontWeight={700} fill="#f59e0b" letterSpacing="0.06em">
            {b.label}
          </text>
          <text x={b.x + 95} y={302} textAnchor="middle" fontSize={9.5} fill="#94a3b8">
            {b.note}
          </text>
          {i < 2 && (
            <line x1={b.x + 192} y1={288} x2={b.x + 214} y2={288} stroke="#f59e0b" strokeWidth={1.5} markerEnd="url(#hmac-arrow-amber)" />
          )}
        </g>
      ))}

      {/* Footer caption */}
      <text x={360} y={344} textAnchor="middle" fontSize={9.5} fill="#64748b" letterSpacing="0.06em">
        the KEY never leaves the server · anyone with KEY can verify but no one without KEY can forge a TAG
      </text>
    </svg>
  )
}

// ---------------------------------------------------------------------------
// HTTP versions — first-byte timeline H1 vs H2 vs H3
// ---------------------------------------------------------------------------
export function HttpVersionsFigure() {
  // Setup phases per protocol — TCP / TLS / GET / RESP, in RTT units (1 RTT = 30 ms here).
  // Each segment shows its phase. Total length = time to first byte.
  type Phase = { label: string; rttDur: number; fill: string }
  type Proto = {
    name: string
    sub: string
    phases: Phase[]
    note: string
  }

  const PROTO_W = 600
  const xStart = 100
  const oneRtt = 70 // px per RTT
  const protocols: Proto[] = [
    {
      name: 'HTTP/1.1',
      sub: 'TCP + TLS 1.3 · 2 RTT handshake',
      phases: [
        { label: 'TCP', rttDur: 1, fill: '#475569' },
        { label: 'TLS', rttDur: 1, fill: '#1d4ed8' },
        { label: 'GET', rttDur: 0.5, fill: '#22d3ee' },
        { label: 'RESP', rttDur: 0.5, fill: '#10b981' },
      ],
      note: '3 RTTs to first byte',
    },
    {
      name: 'HTTP/2',
      sub: 'TCP + TLS 1.3 · multiplexed streams',
      phases: [
        { label: 'TCP', rttDur: 1, fill: '#475569' },
        { label: 'TLS', rttDur: 1, fill: '#1d4ed8' },
        { label: 'GET', rttDur: 0.5, fill: '#22d3ee' },
        { label: 'RESP', rttDur: 0.5, fill: '#10b981' },
      ],
      note: '3 RTTs — same; later requests reuse the connection (0 RTT each)',
    },
    {
      name: 'HTTP/3',
      sub: 'QUIC over UDP · 1-RTT or 0-RTT',
      phases: [
        { label: 'QUIC + TLS', rttDur: 1, fill: '#1d4ed8' },
        { label: 'GET', rttDur: 0.5, fill: '#22d3ee' },
        { label: 'RESP', rttDur: 0.5, fill: '#10b981' },
      ],
      note: '2 RTTs first time · 1 RTT (0-RTT) on resume',
    },
  ]

  return (
    <svg
      viewBox="0 0 720 280"
      width="100%"
      role="img"
      aria-label="HTTP/1.1 vs HTTP/2 vs HTTP/3 first-byte timeline"
      style={{ display: 'block', maxWidth: '100%' }}
    >
      {/* Axis */}
      <text x={36} y={28} fontSize={10.5} fontWeight={700} fill="#94a3b8" letterSpacing="0.08em">
        TIME TO FIRST BYTE (cold start)
      </text>
      <line x1={xStart} y1={42} x2={xStart + 4 * oneRtt} y2={42} stroke="#334155" />
      {[0, 1, 2, 3].map((r) => {
        const x = xStart + r * oneRtt
        return (
          <g key={r}>
            <line x1={x} y1={38} x2={x} y2={46} stroke="#334155" />
            <text x={x} y={56} textAnchor="middle" fontSize={9.5} fill="#64748b">
              {r} RTT
            </text>
          </g>
        )
      })}

      {protocols.map((p, i) => {
        const y = 80 + i * 60
        let cursor = xStart
        return (
          <g key={p.name}>
            <text x={92} y={y + 14} textAnchor="end" fontSize={11.5} fontWeight={700} fill="#e2e8f0">
              {p.name}
            </text>
            <text x={92} y={y + 28} textAnchor="end" fontSize={9} fill="#94a3b8">
              {p.sub}
            </text>

            {p.phases.map((ph, pi) => {
              const w = ph.rttDur * oneRtt
              const sx = cursor
              cursor += w
              return (
                <g key={pi}>
                  <rect x={sx} y={y} width={w} height={32} rx={3} fill={ph.fill} opacity={0.85} />
                  {w > 36 && (
                    <text x={sx + w / 2} y={y + 21} textAnchor="middle" fontSize={10} fontWeight={600} fill="#f1f5f9">
                      {ph.label}
                    </text>
                  )}
                </g>
              )
            })}
            <text x={cursor + 8} y={y + 21} fontSize={9.5} fill="#64748b">
              {p.note}
            </text>
          </g>
        )
      })}

      {/* Footer caption */}
      <rect x={36} y={246} width={648} height={28} rx={4} fill="#0f172a" stroke="#334155" />
      <text x={360} y={264} textAnchor="middle" fontSize={10} fill="#64748b" letterSpacing="0.06em">
        1 RTT ≈ 20–80 ms over Wi-Fi · 200+ ms over poor mobile · each saved RTT shaves startup time
      </text>
    </svg>
  )
}

// ---------------------------------------------------------------------------
// DRM-lite end-to-end flow (this demo's actual encryption + signed URL)
// ---------------------------------------------------------------------------
export function DRMLiteFlowFigure() {
  return (
    <svg
      viewBox="0 0 720 380"
      width="100%"
      role="img"
      aria-label="This demo's DRM-lite encryption and signed-URL flow"
      style={{ display: 'block', maxWidth: '100%' }}
    >
      <defs>
        <ArrowMarker id="drm-arrow" color="#22d3ee" />
        <ArrowMarker id="drm-arrow-amber" color="#f59e0b" />
      </defs>

      {/* TOP STRIP — PUBLISH path */}
      <rect x={20} y={14} width={680} height={140} rx={8} fill="#0f172a" stroke="#22d3ee" strokeWidth={1.2} />
      <text x={36} y={32} fontSize={10.5} fontWeight={700} fill="#22d3ee" letterSpacing="0.08em">
        ① PUBLISH · runs once per asset
      </text>

      {/* Top-strip step boxes — uniform 170px step (140 box + 30 gap) so all
          four boxes fit inside the cyan outer frame (x=20–700) with even
          spacing. Earlier draft mis-spaced the last pair (STORE KEY at
          x=400, WRITE M3U8 at x=540) and they touched edge-to-edge. */}
      {[
        { label: 'GENERATE',  detail: 'random 16-byte AES-128 key',  accent: '#22d3ee' },
        { label: 'ENCRYPT',   detail: 'every .ts segment in place',  accent: '#22d3ee' },
        { label: 'STORE KEY', detail: 'on disk · drm_key_id + key',  accent: '#22d3ee' },
        { label: 'WRITE M3U8', detail: 'placeholder #EXT-X-KEY URI', accent: '#22d3ee' },
      ].map((s, i) => {
        const x = 40 + i * 170
        return (
          <g key={s.label}>
            <rect x={x} y={46} width={140} height={84} rx={6} fill="#1e293b" stroke={s.accent} />
            <text x={x + 70} y={66} textAnchor="middle" fontSize={11} fontWeight={700} fill={s.accent} letterSpacing="0.06em">
              {s.label}
            </text>
            <text x={x + 70} y={86} textAnchor="middle" fontSize={9.5} fill="#cbd5e1">
              {s.detail}
            </text>
            <text x={x + 70} y={102} textAnchor="middle" fontSize={9} fill="#64748b" fontFamily="ui-monospace, monospace">
              step {i + 1}
            </text>
            {i < 3 && (
              <line
                x1={x + 142}
                y1={88}
                x2={x + 168}
                y2={88}
                stroke="#475569"
                strokeWidth={1.4}
                markerEnd="url(#drm-arrow)"
              />
            )}
          </g>
        )
      })}

      {/* BOTTOM STRIP — PLAYBACK path */}
      <rect x={20} y={170} width={680} height={196} rx={8} fill="#0f172a" stroke="#f59e0b" strokeWidth={1.2} />
      <text x={36} y={188} fontSize={10.5} fontWeight={700} fill="#f59e0b" letterSpacing="0.08em">
        ② PLAYBACK · runs per viewer per play
      </text>

      {/* Two lanes inside bottom strip — Backend pulled inward from x=600
          to x=580 so the self-action rect centered on it (width 240) ends
          at x=700, the outer frame's right edge, instead of overflowing. */}
      <text x={120} y={210} textAnchor="middle" fontSize={10} fontWeight={700} fill="#94a3b8" letterSpacing="0.08em">PLAYER</text>
      <text x={580} y={210} textAnchor="middle" fontSize={10} fontWeight={700} fill="#94a3b8" letterSpacing="0.08em">BACKEND</text>

      <line x1={120} y1={218} x2={120} y2={354} stroke="#334155" strokeDasharray="3 4" />
      <line x1={580} y1={218} x2={580} y2={354} stroke="#334155" strokeDasharray="3 4" />

      {/* Playback steps */}
      {[
        { y: 236, label: 'GET master.m3u8 + Bearer token', dir: 'forward' },
        { y: 264, label: 'rewrite #EXT-X-KEY URI → signed license URL', dir: 'self-backend' },
        { y: 290, label: 'manifest with signed key URL', dir: 'backward' },
        { y: 318, label: 'GET license.key?user=…&exp=…&nonce=…&sig=… (no Bearer)', dir: 'forward' },
        { y: 346, label: 'validate signature + claim nonce + return 16-byte key', dir: 'backward' },
      ].map((step, i) => {
        if (step.dir === 'self-backend') {
          return (
            <g key={i}>
              <rect x={460} y={step.y - 12} width={240} height={22} rx={4} fill="#1e293b" stroke="#475569" strokeDasharray="3 3" />
              <text x={580} y={step.y + 3} textAnchor="middle" fontSize={9.5} fill="#cbd5e1">
                {step.label}
              </text>
            </g>
          )
        }
        const reverse = step.dir === 'backward'
        const color = reverse ? '#f59e0b' : '#22d3ee'
        const marker = reverse ? 'url(#drm-arrow-amber)' : 'url(#drm-arrow)'
        const x1 = reverse ? 576 : 124
        const x2 = reverse ? 124 : 576
        return (
          <g key={i}>
            <line x1={x1} y1={step.y} x2={x2} y2={step.y} stroke={color} strokeWidth={1.5} markerEnd={marker} />
            <text x={350} y={step.y - 6} textAnchor="middle" fontSize={9.5} fill={color}>
              {step.label}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

// ---------------------------------------------------------------------------
// VMAF vs bitrate per resolution rung — shows the diminishing returns curve
// that per-title encoding uses to pick a ladder's "knee" bitrate.
// ---------------------------------------------------------------------------
export function VmafLadderFigure() {
  const W = 720
  const H = 360
  const padL = 56
  const padR = 24
  const padT = 38
  const padB = 56
  const innerW = W - padL - padR
  const innerH = H - padT - padB

  const minBR = 300
  const maxBR = 8000
  const minV = 50
  const maxV = 100

  const xOf = (br: number) =>
    padL + (Math.log(br / minBR) / Math.log(maxBR / minBR)) * innerW
  const yOf = (v: number) => padT + (1 - (v - minV) / (maxV - minV)) * innerH

  const rungs = [
    { label: '480p', k: 600, ceil: 92, color: '#22d3ee' },
    { label: '720p', k: 1200, ceil: 95, color: '#10b981' },
    { label: '1080p', k: 2500, ceil: 97, color: '#f59e0b' },
    { label: '2160p (4K)', k: 5000, ceil: 99, color: '#f43f5e' },
  ]

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      role="img"
      aria-label="VMAF score vs bitrate for four resolution rungs"
      style={{ display: 'block', maxWidth: '100%' }}
    >
      <rect x={0} y={0} width={W} height={H} fill="#0f172a" />

      <g stroke="#1e293b" strokeWidth={1}>
        {[60, 70, 80, 90, 100].map((v) => (
          <line key={v} x1={padL} y1={yOf(v)} x2={W - padR} y2={yOf(v)} />
        ))}
        {[500, 1000, 2000, 4000, 8000].map((br) => (
          <line key={br} x1={xOf(br)} y1={padT} x2={xOf(br)} y2={H - padB} />
        ))}
      </g>

      {[500, 1000, 2000, 4000, 8000].map((br) => (
        <text
          key={br}
          x={xOf(br)}
          y={H - padB + 16}
          textAnchor="middle"
          fontSize={10}
          fill="#94a3b8"
        >
          {br}
        </text>
      ))}
      <text x={(W + padL - padR) / 2} y={H - padB + 36} fontSize={11} fill="#cbd5e1" textAnchor="middle">
        encoded bitrate (kbps, log scale)
      </text>
      {[60, 70, 80, 90, 100].map((v) => (
        <text key={v} x={padL - 6} y={yOf(v) + 4} fontSize={10} fill="#94a3b8" textAnchor="end">
          {v}
        </text>
      ))}
      <g transform={`translate(${padL - 38} ${(padT + H - padB) / 2}) rotate(-90)`}>
        <text fontSize={11} fill="#cbd5e1" textAnchor="middle">
          VMAF (0-100)
        </text>
      </g>

      <line
        x1={padL}
        y1={yOf(90)}
        x2={W - padR}
        y2={yOf(90)}
        stroke="#f59e0b"
        strokeWidth={1}
        strokeDasharray="6 4"
      />
      <text
        x={W - padR - 4}
        y={yOf(90) - 6}
        fontSize={10}
        fill="#f59e0b"
        textAnchor="end"
      >
        VMAF 90 — "indistinguishable from source" threshold
      </text>

      {rungs.map((r) => {
        const pts: string[] = []
        for (let br = minBR; br <= maxBR; br *= 1.04) {
          const v = r.ceil - (r.ceil - minV) * Math.exp(-br / r.k)
          pts.push(`${xOf(br).toFixed(1)},${yOf(v).toFixed(1)}`)
        }
        return (
          <polyline
            key={r.label}
            points={pts.join(' ')}
            fill="none"
            stroke={r.color}
            strokeWidth={2}
          />
        )
      })}

      {rungs.map((r, i) => (
        <g key={r.label} transform={`translate(${padL + 8 + i * 130} ${10})`}>
          <rect x={0} y={4} width={12} height={12} fill={r.color} rx={2} />
          <text x={18} y={14} fontSize={11} fill="#cbd5e1">
            {r.label}
          </text>
        </g>
      ))}
    </svg>
  )
}

// ---------------------------------------------------------------------------
// CMCD (player → CDN, CTA-5004) and CMSD (CDN → player, CTA-5006) — the new
// telemetry handshake that lets CDN pace and player negotiate intelligently.
// ---------------------------------------------------------------------------
export function CmcdFlowFigure() {
  const W = 720
  const H = 360
  const playerX = 90
  const cdnX = W - 90

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      role="img"
      aria-label="CMCD request and CMSD response handshake"
      style={{ display: 'block', maxWidth: '100%' }}
    >
      <defs>
        <marker id="arrCmcdReq" viewBox="0 0 10 10" refX={9} refY={5} markerWidth={9} markerHeight={9} orient="auto">
          <path d="M0,0 L10,5 L0,10 z" fill="#22d3ee" />
        </marker>
        <marker id="arrCmcdRes" viewBox="0 0 10 10" refX={9} refY={5} markerWidth={9} markerHeight={9} orient="auto">
          <path d="M0,0 L10,5 L0,10 z" fill="#f59e0b" />
        </marker>
      </defs>

      <rect x={0} y={0} width={W} height={H} fill="#0f172a" />

      <rect x={playerX - 70} y={28} width={140} height={56} rx={6} fill="#1e293b" stroke="#22d3ee" />
      <text x={playerX} y={52} textAnchor="middle" fontSize={13} fontWeight={700} fill="#22d3ee">
        Player
      </text>
      <text x={playerX} y={70} textAnchor="middle" fontSize={10} fill="#94a3b8">
        hls.js · shaka · native
      </text>

      <rect x={cdnX - 70} y={28} width={140} height={56} rx={6} fill="#1e293b" stroke="#f59e0b" />
      <text x={cdnX} y={52} textAnchor="middle" fontSize={13} fontWeight={700} fill="#f59e0b">
        CDN edge
      </text>
      <text x={cdnX} y={70} textAnchor="middle" fontSize={10} fill="#94a3b8">
        Akamai · Cloudflare
      </text>

      <line x1={playerX} y1={84} x2={playerX} y2={H - 16} stroke="#334155" strokeDasharray="3 4" />
      <line x1={cdnX} y1={84} x2={cdnX} y2={H - 16} stroke="#334155" strokeDasharray="3 4" />

      <line
        x1={playerX + 8}
        y1={118}
        x2={cdnX - 8}
        y2={118}
        stroke="#22d3ee"
        strokeWidth={1.5}
        markerEnd="url(#arrCmcdReq)"
      />
      <text x={W / 2} y={112} textAnchor="middle" fontSize={11} fill="#22d3ee" fontWeight={700}>
        GET /seg-042.m4s?CMCD=… &nbsp; · &nbsp; CTA-5004
      </text>

      <rect x={140} y={138} width={440} height={96} rx={6} fill="#0b1322" stroke="#22d3ee" />
      <text x={152} y={156} fontSize={10} fontWeight={700} fill="#22d3ee">
        CMCD payload (URL query or HTTP header)
      </text>
      <text x={152} y={176} fontSize={10.5} fontFamily="ui-monospace, monospace" fill="#cbd5e1">
        br=2800,bl=12000,d=4000,mtp=12200,
      </text>
      <text x={152} y={192} fontSize={10.5} fontFamily="ui-monospace, monospace" fill="#cbd5e1">
        ot=v,sf=h,st=v,sid="3F2-A1",cid="ASSET-7"
      </text>
      <text x={152} y={216} fontSize={9.5} fill="#94a3b8">
        br=requested bitrate &nbsp; bl=buffer length &nbsp; mtp=measured throughput &nbsp; ot=object type
      </text>
      <text x={152} y={228} fontSize={9.5} fill="#94a3b8">
        sf=streaming format &nbsp; st=stream type &nbsp; sid=session ID &nbsp; cid=content ID
      </text>

      <line
        x1={cdnX - 8}
        y1={266}
        x2={playerX + 8}
        y2={266}
        stroke="#f59e0b"
        strokeWidth={1.5}
        markerEnd="url(#arrCmcdRes)"
      />
      <text x={W / 2} y={260} textAnchor="middle" fontSize={11} fill="#f59e0b" fontWeight={700}>
        200 OK + CMSD-Static / CMSD-Dynamic &nbsp; · &nbsp; CTA-5006
      </text>

      <rect x={140} y={284} width={440} height={62} rx={6} fill="#0b1322" stroke="#f59e0b" />
      <text x={152} y={302} fontSize={10} fontWeight={700} fill="#f59e0b">
        CMSD payload (response headers)
      </text>
      <text x={152} y={320} fontSize={10.5} fontFamily="ui-monospace, monospace" fill="#cbd5e1">
        CMSD-Static: ot=v,n="edge-LAX"
      </text>
      <text x={152} y={336} fontSize={10.5} fontFamily="ui-monospace, monospace" fill="#cbd5e1">
        CMSD-Dynamic: etp=2500,rtt=42,dl=18,du=4000
      </text>
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Recommendation 4-stage cascade — recall → coarse rank → fine rank → rerank.
// Funnel of progressively narrower rectangles with item counts and latency
// budgets per stage.
// ---------------------------------------------------------------------------
export function RecommendationCascadeFigure() {
  const W = 720
  const H = 360

  const stages = [
    { label: 'Catalog', count: '50,000 items', budget: 'offline', sub: 'every asset that exists', color: '#475569' },
    { label: 'Recall', count: '10,000 items', budget: '20 ms', sub: 'Milvus ANN + collaborative-filtering + hot list', color: '#22d3ee' },
    { label: 'Coarse rank', count: '1,000 items', budget: '40 ms', sub: 'DSSM two-tower (Triton)', color: '#10b981' },
    { label: 'Fine rank', count: '100 items', budget: '60 ms', sub: 'DIN / SIM (Triton)', color: '#f59e0b' },
    { label: 'Rerank', count: '20 items', budget: '20 ms', sub: 'multi-objective · diversity · explore', color: '#f43f5e' },
  ]

  const rowH = 56
  const gapY = 6
  const maxW = W - 80

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      role="img"
      aria-label="Recommendation cascade funnel from catalog to final ranked list"
      style={{ display: 'block', maxWidth: '100%' }}
    >
      <rect x={0} y={0} width={W} height={H} fill="#0f172a" />
      <text x={W / 2} y={26} textAnchor="middle" fontSize={11} fill="#94a3b8" letterSpacing="0.08em">
        RECALL → COARSE → FINE → RERANK &nbsp; · &nbsp; ~140 ms end-to-end budget
      </text>

      {stages.map((s, i) => {
        const w = maxW * (1 - i * 0.16)
        const x = (W - w) / 2
        const y = 44 + i * (rowH + gapY)
        return (
          <g key={s.label}>
            <rect
              x={x}
              y={y}
              width={w}
              height={rowH}
              rx={6}
              fill={s.color}
              fillOpacity={i === 0 ? 0.16 : 0.3}
              stroke={s.color}
            />
            <text x={x + 14} y={y + 22} fontSize={13} fontWeight={700} fill="#f1f5f9">
              {s.label}
            </text>
            <text x={x + 14} y={y + 40} fontSize={10.5} fill="#cbd5e1">
              {s.sub}
            </text>
            <text x={x + w - 14} y={y + 22} textAnchor="end" fontSize={12} fontWeight={700} fill="#f1f5f9">
              {s.count}
            </text>
            <text x={x + w - 14} y={y + 40} textAnchor="end" fontSize={10.5} fill="#cbd5e1">
              {s.budget}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

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

// ---------------------------------------------------------------------------
// Ad operations — waterfall (sequential) vs unified auction (parallel) for ad
// inventory. Same demand sources, different decision topology.
// ---------------------------------------------------------------------------
export function AdAuctionFigure() {
  const W = 720
  const H = 360
  const colL = 'waterfall'
  const colR = 'unified'

  const bidders = [
    { name: 'DSP A', cpm: '$4.20', color: '#22d3ee' },
    { name: 'DSP B', cpm: '$3.10', color: '#10b981' },
    { name: 'DSP C', cpm: '$5.50', color: '#f59e0b' },
    { name: 'House',  cpm: '$1.80', color: '#8b5cf6' },
  ]

  const padX = 40
  const colW = (W - padX * 3) / 2
  const leftX = padX
  const rightX = padX + colW + padX

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      role="img"
      aria-label="Waterfall versus unified auction comparison"
      style={{ display: 'block', maxWidth: '100%' }}
    >
      <rect x={0} y={0} width={W} height={H} fill="#0f172a" />

      {[
        { x: leftX, label: 'WATERFALL', sub: 'sequential, ~400 ms total, latency stacks', color: '#94a3b8', key: colL },
        { x: rightX, label: 'UNIFIED AUCTION', sub: 'parallel, ~150 ms, highest bid wins', color: '#22d3ee', key: colR },
      ].map((col) => (
        <g key={col.key}>
          <rect x={col.x} y={20} width={colW} height={H - 40} rx={8} fill="#0b1322" stroke="#1e293b" />
          <text x={col.x + colW / 2} y={44} textAnchor="middle" fontSize={13} fontWeight={700} fill={col.color} letterSpacing="0.08em">
            {col.label}
          </text>
          <text x={col.x + colW / 2} y={60} textAnchor="middle" fontSize={10} fill="#94a3b8">
            {col.sub}
          </text>
        </g>
      ))}

      <g>
        {bidders.map((b, i) => {
          const y = 88 + i * 52
          return (
            <g key={`l-${b.name}`}>
              <rect x={leftX + 24} y={y} width={colW - 48} height={36} rx={5} fill={b.color} fillOpacity={0.25} stroke={b.color} />
              <text x={leftX + 36} y={y + 22} fontSize={12} fontWeight={700} fill="#f1f5f9">
                {i + 1}. {b.name}
              </text>
              <text x={leftX + colW - 36} y={y + 22} textAnchor="end" fontSize={11} fill="#cbd5e1">
                {b.cpm}
              </text>
            </g>
          )
        })}
        <text x={leftX + colW / 2} y={H - 36} textAnchor="middle" fontSize={10} fill="#f43f5e">
          first bidder to clear price floor wins → DSP A wins at $4.20
        </text>
        <text x={leftX + colW / 2} y={H - 22} textAnchor="middle" fontSize={10} fill="#94a3b8">
          ($5.50 from DSP C never queried)
        </text>
      </g>

      <g>
        {bidders.map((b, i) => {
          const y = 88 + i * 52
          return (
            <g key={`r-${b.name}`}>
              <rect x={rightX + 24} y={y} width={colW - 48} height={36} rx={5} fill={b.color} fillOpacity={0.25} stroke={b.color} />
              <text x={rightX + 36} y={y + 22} fontSize={12} fontWeight={700} fill="#f1f5f9">
                {b.name}
              </text>
              <text x={rightX + colW - 36} y={y + 22} textAnchor="end" fontSize={11} fill="#cbd5e1">
                {b.cpm}
              </text>
            </g>
          )
        })}
        <text x={rightX + colW / 2} y={H - 36} textAnchor="middle" fontSize={10} fill="#10b981">
          all bids collected simultaneously → DSP C wins at $5.50
        </text>
        <text x={rightX + colW / 2} y={H - 22} textAnchor="middle" fontSize={10} fill="#94a3b8">
          (publisher revenue uplift ~25-30% in practice)
        </text>
      </g>
    </svg>
  )
}

// ---------------------------------------------------------------------------
// CMS editorial workflow — six-state lifecycle from draft to archived, with
// retreat arrows for rejections and unscheduling.
// ---------------------------------------------------------------------------
export function CmsWorkflowFigure() {
  const W = 720
  const H = 280
  const states = [
    { id: 'Draft', desc: 'editor working', color: '#94a3b8' },
    { id: 'Review', desc: 'legal + QC', color: '#8b5cf6' },
    { id: 'Scheduled', desc: 'rights window pending', color: '#22d3ee' },
    { id: 'Live', desc: 'visible in catalog', color: '#10b981' },
    { id: 'Hidden', desc: 'soft-removed', color: '#f59e0b' },
    { id: 'Archived', desc: 'rights expired', color: '#475569' },
  ]
  const boxW = 96
  const boxH = 60
  const gap = (W - 60 - states.length * boxW) / (states.length - 1)
  const xOf = (i: number) => 30 + i * (boxW + gap)
  const yTop = 80
  const cy = yTop + boxH / 2

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      role="img"
      aria-label="CMS editorial state machine"
      style={{ display: 'block', maxWidth: '100%' }}
    >
      <defs>
        <marker id="arrCmsFwd" viewBox="0 0 10 10" refX={9} refY={5} markerWidth={9} markerHeight={9} orient="auto">
          <path d="M0,0 L10,5 L0,10 z" fill="#cbd5e1" />
        </marker>
        <marker id="arrCmsBack" viewBox="0 0 10 10" refX={9} refY={5} markerWidth={9} markerHeight={9} orient="auto">
          <path d="M0,0 L10,5 L0,10 z" fill="#f43f5e" />
        </marker>
      </defs>
      <rect x={0} y={0} width={W} height={H} fill="#0f172a" />
      <text x={W / 2} y={28} textAnchor="middle" fontSize={11} fill="#94a3b8" letterSpacing="0.08em">
        EDITORIAL LIFECYCLE · DRAFT → REVIEW → SCHEDULED → LIVE → HIDDEN → ARCHIVED
      </text>

      {states.map((s, i) => (
        <g key={s.id}>
          <rect x={xOf(i)} y={yTop} width={boxW} height={boxH} rx={6} fill={s.color} fillOpacity={0.25} stroke={s.color} />
          <text x={xOf(i) + boxW / 2} y={yTop + 26} textAnchor="middle" fontSize={13} fontWeight={700} fill="#f1f5f9">
            {s.id}
          </text>
          <text x={xOf(i) + boxW / 2} y={yTop + 44} textAnchor="middle" fontSize={9.5} fill="#cbd5e1">
            {s.desc}
          </text>
        </g>
      ))}

      {states.slice(0, -1).map((_, i) => (
        <line
          key={`fwd-${i}`}
          x1={xOf(i) + boxW + 2}
          y1={cy - 6}
          x2={xOf(i + 1) - 4}
          y2={cy - 6}
          stroke="#cbd5e1"
          strokeWidth={1.4}
          markerEnd="url(#arrCmsFwd)"
        />
      ))}

      {/* Backward: Review → Draft (rejection), Live → Hidden → Archived path collapses. Hidden can re-enter Live. */}
      <path
        d={`M ${xOf(1)} ${cy + 8} C ${xOf(1) - 20} ${cy + 36}, ${xOf(0) + boxW + 20} ${cy + 36}, ${xOf(0) + boxW + 2} ${cy + 8}`}
        stroke="#f43f5e"
        strokeWidth={1.3}
        fill="none"
        markerEnd="url(#arrCmsBack)"
      />
      <text x={(xOf(0) + xOf(1) + boxW) / 2} y={cy + 52} textAnchor="middle" fontSize={9.5} fill="#f43f5e">
        rejected
      </text>

      <path
        d={`M ${xOf(4)} ${cy + 8} C ${xOf(4) - 20} ${cy + 36}, ${xOf(3) + boxW + 20} ${cy + 36}, ${xOf(3) + boxW + 2} ${cy + 8}`}
        stroke="#22d3ee"
        strokeWidth={1.3}
        fill="none"
        markerEnd="url(#arrCmsFwd)"
      />
      <text x={(xOf(3) + xOf(4) + boxW) / 2} y={cy + 52} textAnchor="middle" fontSize={9.5} fill="#22d3ee">
        un-hide
      </text>
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Concurrent-stream guard — decision flow from incoming play request to
// allow/deny through three checks: device known, concurrent count, geo.
// ---------------------------------------------------------------------------
export function ConcurrentStreamGuardFigure() {
  const W = 720
  const H = 320

  const cy = 80
  const cyDecide = (i: number) => 130 + i * 56
  const allowY = H - 50
  const denyX = W - 80

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      role="img"
      aria-label="Concurrent-stream policy guard decision flow"
      style={{ display: 'block', maxWidth: '100%' }}
    >
      <defs>
        <marker id="arrGuard" viewBox="0 0 10 10" refX={9} refY={5} markerWidth={8} markerHeight={8} orient="auto">
          <path d="M0,0 L10,5 L0,10 z" fill="#cbd5e1" />
        </marker>
      </defs>
      <rect x={0} y={0} width={W} height={H} fill="#0f172a" />
      <text x={W / 2} y={24} textAnchor="middle" fontSize={11} fill="#94a3b8" letterSpacing="0.08em">
        PLAY REQUEST → DEVICE CHECK → CONCURRENT COUNT → GEO DRIFT → ALLOW
      </text>

      {/* Entry */}
      <rect x={W / 2 - 80} y={cy - 24} width={160} height={36} rx={6} fill="#1e293b" stroke="#22d3ee" />
      <text x={W / 2} y={cy} textAnchor="middle" fontSize={12} fontWeight={700} fill="#22d3ee">
        play request
      </text>

      {/* Three decisions */}
      {[
        { label: 'device fingerprint known?', y: cyDecide(0), fail: 'unknown device → deny', color: '#10b981' },
        { label: 'live streams < household cap (e.g. 4)?', y: cyDecide(1), fail: 'cap exceeded → deny', color: '#f59e0b' },
        { label: 'geo within household region?', y: cyDecide(2), fail: 'drift → step-up auth', color: '#f43f5e' },
      ].map((d, i) => (
        <g key={i}>
          <rect x={W / 2 - 170} y={d.y - 18} width={340} height={36} rx={6} fill="#0b1322" stroke={d.color} />
          <text x={W / 2} y={d.y + 4} textAnchor="middle" fontSize={11.5} fill="#cbd5e1">
            {d.label}
          </text>
          <text x={denyX + 30} y={d.y + 4} textAnchor="end" fontSize={10} fill="#f43f5e">
            {d.fail}
          </text>
          <line
            x1={W / 2 + 170}
            y1={d.y}
            x2={denyX + 32}
            y2={d.y}
            stroke="#f43f5e"
            strokeWidth={1}
            strokeDasharray="4 3"
          />
        </g>
      ))}

      {/* Connect entry → first decision and decisions vertically */}
      <line x1={W / 2} y1={cy + 12} x2={W / 2} y2={cyDecide(0) - 18} stroke="#cbd5e1" strokeWidth={1.2} markerEnd="url(#arrGuard)" />
      {[0, 1].map((i) => (
        <line
          key={`v-${i}`}
          x1={W / 2}
          y1={cyDecide(i) + 18}
          x2={W / 2}
          y2={cyDecide(i + 1) - 18}
          stroke="#cbd5e1"
          strokeWidth={1.2}
          markerEnd="url(#arrGuard)"
        />
      ))}

      {/* Allow */}
      <line x1={W / 2} y1={cyDecide(2) + 18} x2={W / 2} y2={allowY - 16} stroke="#10b981" strokeWidth={1.4} markerEnd="url(#arrGuard)" />
      <rect x={W / 2 - 60} y={allowY - 16} width={120} height={32} rx={6} fill="#10b981" fillOpacity={0.25} stroke="#10b981" />
      <text x={W / 2} y={allowY + 5} textAnchor="middle" fontSize={12} fontWeight={700} fill="#10b981">
        allow + mint token
      </text>
    </svg>
  )
}

// ---------------------------------------------------------------------------
// FAST channel EPG slice — a linear schedule strip with SCTE-35 ad markers
// drawn as vertical bands inside each program block.
// ---------------------------------------------------------------------------
export function FastEpgFigure() {
  const W = 720
  const H = 280
  const padL = 56
  const padR = 24
  const trackTop = 80
  const trackH = 60
  const innerW = W - padL - padR

  // 6 PM to 11 PM (5 hours)
  const startMin = 18 * 60
  const endMin = 23 * 60
  const totalMin = endMin - startMin
  const xOf = (min: number) => padL + ((min - startMin) / totalMin) * innerW

  const programs = [
    { title: 'Sitcom: "Apartment 5B"', start: 18 * 60, end: 18 * 60 + 30, color: '#22d3ee' },
    { title: 'Crime drama: "Cold Case"', start: 18 * 60 + 30, end: 19 * 60 + 30, color: '#8b5cf6' },
    { title: 'News bulletin', start: 19 * 60 + 30, end: 20 * 60, color: '#94a3b8' },
    { title: 'Feature film: "Northwind"', start: 20 * 60, end: 22 * 60, color: '#f59e0b' },
    { title: 'Late night: "After Hours"', start: 22 * 60, end: 23 * 60, color: '#f43f5e' },
  ]
  // SCTE-35 ad breaks — vertical markers
  const adBreaks = [
    18 * 60 + 15,
    18 * 60 + 55,
    19 * 60 + 15,
    20 * 60 + 30,
    21 * 60,
    21 * 60 + 30,
    22 * 60 + 20,
  ]

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      role="img"
      aria-label="FAST channel evening schedule with SCTE-35 ad markers"
      style={{ display: 'block', maxWidth: '100%' }}
    >
      <rect x={0} y={0} width={W} height={H} fill="#0f172a" />
      <text x={W / 2} y={24} textAnchor="middle" fontSize={11} fill="#94a3b8" letterSpacing="0.08em">
        FAST CHANNEL EPG · 18:00 → 23:00 · SCTE-35 MARKERS = AD BREAK CUE-OUT POINTS
      </text>
      <text x={padL} y={48} fontSize={11} fill="#cbd5e1">
        Channel: Drama 24
      </text>

      {/* Time ruler */}
      {[18, 19, 20, 21, 22, 23].map((h) => (
        <g key={h}>
          <line x1={xOf(h * 60)} y1={trackTop - 12} x2={xOf(h * 60)} y2={trackTop + trackH + 8} stroke="#1e293b" strokeWidth={1} />
          <text x={xOf(h * 60)} y={trackTop - 18} textAnchor="middle" fontSize={10} fill="#94a3b8">
            {String(h).padStart(2, '0')}:00
          </text>
        </g>
      ))}

      {programs.map((p, i) => {
        const x = xOf(p.start)
        const w = xOf(p.end) - x
        return (
          <g key={i}>
            <rect x={x} y={trackTop} width={w} height={trackH} rx={4} fill={p.color} fillOpacity={0.32} stroke={p.color} />
            <text x={x + 8} y={trackTop + 22} fontSize={10.5} fontWeight={700} fill="#f1f5f9">
              {p.title}
            </text>
            <text x={x + 8} y={trackTop + 38} fontSize={9.5} fill="#cbd5e1">
              {Math.floor(p.start / 60)}:{String(p.start % 60).padStart(2, '0')} - {Math.floor(p.end / 60)}:{String(p.end % 60).padStart(2, '0')}
            </text>
          </g>
        )
      })}

      {/* SCTE-35 markers */}
      {adBreaks.map((m, i) => (
        <g key={`ad-${i}`}>
          <line x1={xOf(m)} y1={trackTop - 4} x2={xOf(m)} y2={trackTop + trackH + 4} stroke="#f43f5e" strokeWidth={1.5} />
          <circle cx={xOf(m)} cy={trackTop + trackH + 12} r={4} fill="#f43f5e" />
        </g>
      ))}

      <g transform={`translate(${padL} ${trackTop + trackH + 36})`}>
        <line x1={0} y1={0} x2={18} y2={0} stroke="#f43f5e" strokeWidth={1.5} />
        <text x={26} y={4} fontSize={10} fill="#cbd5e1">
          SCTE-35 CUE-OUT (ad break opportunity)
        </text>
        <rect x={240} y={-6} width={14} height={12} fill="#22d3ee" fillOpacity={0.35} stroke="#22d3ee" />
        <text x={260} y={4} fontSize={10} fill="#cbd5e1">
          program block (linear, no seeking)
        </text>
      </g>
      <text x={padL} y={H - 16} fontSize={10} fill="#94a3b8">
        Player tunes in, manifest is sliding-window live (DVR optional); SSAI swaps fills at each marker.
      </text>
    </svg>
  )
}
