import { ArrowMarker } from './_shared'

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
      {families.flatMap((f) => {
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
