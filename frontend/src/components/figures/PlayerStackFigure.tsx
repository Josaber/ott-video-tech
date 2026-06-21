import { ArrowMarker } from './_shared'

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
