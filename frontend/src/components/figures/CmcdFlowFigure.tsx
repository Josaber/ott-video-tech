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
