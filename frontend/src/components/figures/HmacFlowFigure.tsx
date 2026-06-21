import { ArrowMarker } from './_shared'

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
