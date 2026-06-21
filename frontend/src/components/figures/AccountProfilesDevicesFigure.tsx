import { ArrowMarker } from './_shared'

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
