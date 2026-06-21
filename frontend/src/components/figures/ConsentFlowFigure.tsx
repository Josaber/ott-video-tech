import { ArrowMarker } from './_shared'

// ---------------------------------------------------------------------------
// Privacy & consent — TCF gate data flow
// ---------------------------------------------------------------------------
export function ConsentFlowFigure() {
  const W = 720
  const H = 540

  // Vertical stack for USER -> CMP -> TCF STRING, then horizontal fan-out
  // to the 3 purpose gates and matching consumers.
  const stackW = 240
  const stackX = (W - stackW) / 2

  const userY = 28
  const cmpY = 102
  const tcfY = 176
  const fanY = 260                  // horizontal bar y after TCF
  const gateY = 296                 // purpose gates row
  const consumerY = 410             // consumer row
  const boxH = 56

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      role="img"
      aria-label="Consent flow and TCF gate"
      style={{ display: 'block', maxWidth: '100%' }}
    >
      <defs>
        <ArrowMarker id="cf-arrow" />
        <ArrowMarker id="cf-arrow-block" color="#dc2626" />
      </defs>

      {/* USER */}
      <rect x={stackX} y={userY} width={stackW} height={boxH} rx={6} fill="#1e293b" stroke="#22d3ee" />
      <text x={W / 2} y={userY + 24} textAnchor="middle" fontSize={12} fontWeight={700} fill="#22d3ee" letterSpacing="0.08em">USER</text>
      <text x={W / 2} y={userY + 42} textAnchor="middle" fontSize={10.5} fill="#94a3b8">first visit / new device</text>

      {/* USER → CMP */}
      <line x1={W / 2} y1={userY + boxH} x2={W / 2} y2={cmpY - 4} stroke="#475569" strokeWidth={1.6} markerEnd="url(#cf-arrow)" />

      {/* CMP */}
      <rect x={stackX} y={cmpY} width={stackW} height={boxH} rx={6} fill="#1e293b" stroke="#f59e0b" />
      <text x={W / 2} y={cmpY + 24} textAnchor="middle" fontSize={12} fontWeight={700} fill="#f59e0b" letterSpacing="0.08em">CMP</text>
      <text x={W / 2} y={cmpY + 42} textAnchor="middle" fontSize={10.5} fill="#94a3b8">OneTrust / Sourcepoint / Didomi</text>

      {/* CMP → TCF */}
      <line x1={W / 2} y1={cmpY + boxH} x2={W / 2} y2={tcfY - 4} stroke="#475569" strokeWidth={1.6} markerEnd="url(#cf-arrow)" />

      {/* TCF v2 STRING */}
      <rect x={stackX} y={tcfY} width={stackW} height={boxH} rx={6} fill="#0f172a" stroke="#22d3ee" strokeWidth={1.5} />
      <text x={W / 2} y={tcfY + 24} textAnchor="middle" fontSize={12} fontWeight={700} fill="#22d3ee" letterSpacing="0.06em" fontFamily="ui-monospace, monospace">
        TCF v2 STRING
      </text>
      <text x={W / 2} y={tcfY + 42} textAnchor="middle" fontSize={10} fill="#94a3b8" fontFamily="ui-monospace, monospace">
        CPFh3wA… per-purpose flags
      </text>

      {/* TCF → fan-out bus */}
      <line x1={W / 2} y1={tcfY + boxH} x2={W / 2} y2={fanY} stroke="#475569" strokeWidth={1.6} />
      <line x1={120} y1={fanY} x2={600} y2={fanY} stroke="#475569" strokeWidth={1.4} />
      <line x1={120} y1={fanY} x2={120} y2={gateY - 4} stroke="#475569" strokeWidth={1.4} markerEnd="url(#cf-arrow)" />
      <line x1={360} y1={fanY} x2={360} y2={gateY - 4} stroke="#475569" strokeWidth={1.4} markerEnd="url(#cf-arrow)" />
      <line x1={600} y1={fanY} x2={600} y2={gateY - 4} stroke="#475569" strokeWidth={1.4} markerEnd="url(#cf-arrow)" />

      {/* Purpose gates */}
      {[
        { cx: 120, label: 'STORAGE', note: 'localStorage, cookies' },
        { cx: 360, label: 'ANALYTICS', note: 'product telemetry' },
        { cx: 600, label: 'TARGETED ADS', note: 'IFA · retargeting' },
      ].map((g) => (
        <g key={g.label}>
          <rect x={g.cx - 90} y={gateY} width={180} height={66} rx={6} fill="#1e293b" stroke="#334155" />
          <text x={g.cx} y={gateY + 22} textAnchor="middle" fontSize={11.5} fontWeight={700} fill="#e2e8f0" letterSpacing="0.06em">
            {g.label}
          </text>
          <text x={g.cx} y={gateY + 40} textAnchor="middle" fontSize={10} fill="#94a3b8">{g.note}</text>
          <text x={g.cx} y={gateY + 56} textAnchor="middle" fontSize={9.5} fill="#64748b">purpose gate</text>
        </g>
      ))}

      {/* Allow / block arrows */}
      <line x1={120} y1={gateY + 66} x2={120} y2={consumerY - 4} stroke="#10b981" strokeWidth={1.6} markerEnd="url(#cf-arrow)" />
      <text x={130} y={(gateY + 66 + consumerY) / 2 + 4} fontSize={10} fill="#10b981">allow</text>
      <line x1={360} y1={gateY + 66} x2={360} y2={consumerY - 4} stroke="#10b981" strokeWidth={1.6} markerEnd="url(#cf-arrow)" />
      <text x={370} y={(gateY + 66 + consumerY) / 2 + 4} fontSize={10} fill="#10b981">allow</text>
      <line x1={600} y1={gateY + 66} x2={600} y2={consumerY - 4} stroke="#dc2626" strokeWidth={1.6} strokeDasharray="4 3" markerEnd="url(#cf-arrow-block)" />
      <text x={610} y={(gateY + 66 + consumerY) / 2 + 4} fontSize={10} fill="#dc2626">blocked</text>

      {/* Consumers */}
      {[
        { cx: 120, label: 'DB', note: 'session, prefs' },
        { cx: 360, label: 'ANALYTICS VENDOR', note: 'Mux, Mixpanel' },
        { cx: 600, label: 'AD SERVER', note: '— bidless' },
      ].map((c) => (
        <g key={c.label}>
          <rect x={c.cx - 90} y={consumerY} width={180} height={48} rx={6} fill="#1e293b" stroke="#334155" />
          <text x={c.cx} y={consumerY + 20} textAnchor="middle" fontSize={11} fontWeight={700} fill="#cbd5e1" letterSpacing="0.06em">
            {c.label}
          </text>
          <text x={c.cx} y={consumerY + 38} textAnchor="middle" fontSize={10} fill="#94a3b8">{c.note}</text>
        </g>
      ))}

      {/* Footer */}
      <text x={W / 2} y={H - 28} textAnchor="middle" fontSize={10.5} fill="#64748b" letterSpacing="0.06em">
        EVERY DOWNSTREAM CONSUMER MUST READ THE TCF STRING BEFORE PROCESSING
      </text>
    </svg>
  )
}
