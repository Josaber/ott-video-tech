import { ArrowMarker } from './_shared'

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
