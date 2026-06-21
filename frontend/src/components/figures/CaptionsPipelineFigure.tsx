// ---------------------------------------------------------------------------
// Caption / subtitle production pipeline — source audio → ASR transcribe →
// align + clean → translate fan-out (per language) → vendor QC → package
// (WebVTT) → HLS SUBTITLES group.
// ---------------------------------------------------------------------------
export function CaptionsPipelineFigure() {
  const W = 760
  const H = 380

  const stageH = 56
  const stageW = 152
  const rowY = 100
  const gap = (W - 48 - 4 * stageW) / 3
  const xOf = (i: number) => 24 + i * (stageW + gap)

  const stages = [
    { label: 'Transcribe',  sub: 'Whisper / Deepgram', color: '#22d3ee' },
    { label: 'Align + clean', sub: 'reading rate, line breaks', color: '#10b981' },
    { label: 'Translate', sub: 'MT + post-edit per language', color: '#f59e0b' },
    { label: 'Package', sub: 'WebVTT segments + HLS group', color: '#f43f5e' },
  ]

  const langs = ['EN', 'ES', 'PT-BR', 'FR', 'JA', 'KO']
  const fanTop = 220
  const langW = 56
  const langGap = 8
  const totalFanW = langs.length * langW + (langs.length - 1) * langGap
  const fanLeft = xOf(2) + stageW / 2 - totalFanW / 2

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      role="img"
      aria-label="Caption production pipeline with language fan-out"
      style={{ display: 'block', maxWidth: '100%' }}
    >
      <defs>
        <marker id="capArr" viewBox="0 0 10 10" refX={9} refY={5} markerWidth={9} markerHeight={9} orient="auto">
          <path d="M0,0 L10,5 L0,10 z" fill="#cbd5e1" />
        </marker>
        <marker id="capArrAmber" viewBox="0 0 10 10" refX={9} refY={5} markerWidth={9} markerHeight={9} orient="auto">
          <path d="M0,0 L10,5 L0,10 z" fill="#f59e0b" />
        </marker>
      </defs>

      <rect x={0} y={0} width={W} height={H} fill="#0f172a" />

      <text x={W / 2} y={30} textAnchor="middle" fontSize={13} fontWeight={700} fill="#f1f5f9" letterSpacing="0.06em">
        CAPTION / SUBTITLE PIPELINE — language fan-out
      </text>
      <text x={W / 2} y={50} textAnchor="middle" fontSize={11} fill="#94a3b8">
        Source audio in → translated WebVTT tracks out, one per target language
      </text>

      {/* Source audio */}
      <rect x={24} y={rowY - 28} width={stageW} height={20} rx={4} fill="#0b1322" stroke="#94a3b8" />
      <text x={24 + stageW / 2} y={rowY - 14} textAnchor="middle" fontSize={10.5} fontWeight={600} fill="#cbd5e1">
        Source-language audio
      </text>

      {/* Stage boxes in a single row */}
      {stages.map((s, i) => (
        <g key={s.label}>
          <rect x={xOf(i)} y={rowY} width={stageW} height={stageH} rx={6} fill={s.color} fillOpacity={0.28} stroke={s.color} strokeWidth={1.4} />
          <text x={xOf(i) + stageW / 2} y={rowY + 24} textAnchor="middle" fontSize={13} fontWeight={700} fill="#f1f5f9">
            {s.label}
          </text>
          <text x={xOf(i) + stageW / 2} y={rowY + 42} textAnchor="middle" fontSize={10} fill="#cbd5e1">
            {s.sub}
          </text>
        </g>
      ))}

      {/* Forward arrows */}
      {stages.slice(0, -1).map((_, i) => (
        <line
          key={`fwd-${i}`}
          x1={xOf(i) + stageW + 2}
          y1={rowY + stageH / 2}
          x2={xOf(i + 1) - 4}
          y2={rowY + stageH / 2}
          stroke="#cbd5e1"
          strokeWidth={1.6}
          markerEnd="url(#capArr)"
        />
      ))}

      {/* Source audio → Transcribe */}
      <line
        x1={24 + stageW / 2}
        y1={rowY - 8}
        x2={24 + stageW / 2}
        y2={rowY - 2}
        stroke="#cbd5e1"
        strokeWidth={1.4}
        markerEnd="url(#capArr)"
      />

      {/* Language fan-out under Translate */}
      <text x={xOf(2) + stageW / 2} y={205} textAnchor="middle" fontSize={11} fontWeight={700} fill="#f59e0b">
        per-language fan-out
      </text>
      {langs.map((lang, i) => {
        const cx = fanLeft + i * (langW + langGap)
        return (
          <g key={lang}>
            <line
              x1={xOf(2) + stageW / 2}
              y1={rowY + stageH}
              x2={cx + langW / 2}
              y2={fanTop}
              stroke="#f59e0b"
              strokeWidth={1.2}
              markerEnd="url(#capArrAmber)"
            />
            <rect x={cx} y={fanTop} width={langW} height={28} rx={4} fill="#1e293b" stroke="#f59e0b" strokeWidth={1.2} />
            <text x={cx + langW / 2} y={fanTop + 18} textAnchor="middle" fontSize={11} fontWeight={700} fill="#fbbf24">
              {lang}
            </text>
          </g>
        )
      })}

      {/* Each language joins the Package stage */}
      <line x1={fanLeft + totalFanW / 2} y1={fanTop + 32} x2={fanLeft + totalFanW / 2} y2={fanTop + 60} stroke="#475569" strokeWidth={1.2} strokeDasharray="3 3" />
      <line x1={fanLeft + totalFanW / 2} y1={fanTop + 60} x2={xOf(3) + stageW / 2} y2={fanTop + 60} stroke="#475569" strokeWidth={1.2} strokeDasharray="3 3" />
      <line x1={xOf(3) + stageW / 2} y1={fanTop + 60} x2={xOf(3) + stageW / 2} y2={rowY + stageH + 6} stroke="#475569" strokeWidth={1.2} strokeDasharray="3 3" markerEnd="url(#capArr)" />

      {/* Output examples */}
      <text x={W / 2} y={H - 60} textAnchor="middle" fontSize={11} fill="#cbd5e1">
        Output: one WebVTT media playlist per language, all grouped via{' '}
        <tspan fontFamily="ui-monospace, monospace" fill="#22d3ee">EXT-X-MEDIA TYPE=SUBTITLES,GROUP-ID="subs"</tspan>
      </text>
      <text x={W / 2} y={H - 32} textAnchor="middle" fontSize={10.5} fill="#94a3b8">
        Source-language captions add HoH / SDH cues (speaker IDs, sound effects).
      </text>
      <text x={W / 2} y={H - 16} textAnchor="middle" fontSize={10.5} fill="#94a3b8">
        Tentpole content gets human post-edit; back catalog often ships MT-only.
      </text>
    </svg>
  )
}
