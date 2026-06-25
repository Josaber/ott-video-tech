import { useEffect, useState } from 'react'
import { PlayCircle } from 'lucide-react'
import { api, ContinueWatchingItem } from '../api/client'

interface Props {
  onSelect: (id: string) => void
}

export function ContinueWatching({ onSelect }: Props) {
  const [items, setItems] = useState<ContinueWatchingItem[]>([])

  useEffect(() => {
    let cancelled = false
    api.continueWatching()
      .then((list) => { if (!cancelled) setItems(list) })
      .catch(() => { if (!cancelled) setItems([]) })
    return () => { cancelled = true }
  }, [])

  if (items.length === 0) return null

  return (
    <div className="panel">
      <h1>Continue watching</h1>
      <div className="cw-rail">
        {items.map((it) => {
          const pct = it.durationMs && it.durationMs > 0
            ? Math.min(100, (it.positionMs / it.durationMs) * 100)
            : 0
          // Sprite mirrors trick-play layout: 160×90 tiles, 10 cols,
          // one tile every 10 s of source. Pick the cell at the saved
          // playhead so the card shows exactly the frame the user left on.
          const SPRITE_INTERVAL_SEC = 10
          const SPRITE_W = 160
          const SPRITE_H = 90
          const SPRITE_COLS = 10
          const cellIdx = Math.max(0, Math.floor((it.positionMs / 1000) / SPRITE_INTERVAL_SEC))
          const col = cellIdx % SPRITE_COLS
          const row = Math.floor(cellIdx / SPRITE_COLS)
          const spriteStyle = it.spriteUrl
            ? {
                backgroundImage: `url(${it.spriteUrl})`,
                backgroundPosition: `-${col * SPRITE_W}px -${row * SPRITE_H}px`,
                backgroundRepeat: 'no-repeat' as const,
              }
            : undefined
          return (
            <button
              key={it.assetId}
              className="cw-card"
              onClick={() => onSelect(it.assetId)}
              title={`Resume at ${fmt(it.positionMs / 1000)}`}
            >
              <div className="cw-thumb" style={spriteStyle}>
                {!it.spriteUrl && <PlayCircle size={32} />}
              </div>
              <div className="cw-title">{it.title}</div>
              <div className="cw-progress-track">
                <div className="cw-progress-fill" style={{ width: `${pct}%` }} />
              </div>
              <div className="cw-meta">
                {fmt(it.positionMs / 1000)}
                {it.durationMs ? ` / ${fmt(it.durationMs / 1000)}` : ''}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function fmt(s: number): string {
  if (!Number.isFinite(s) || s < 0) return '0:00'
  const t = Math.floor(s)
  const h = Math.floor(t / 3600)
  const m = Math.floor((t % 3600) / 60)
  const ss = t % 60
  return h > 0
    ? `${h}:${m.toString().padStart(2, '0')}:${ss.toString().padStart(2, '0')}`
    : `${m}:${ss.toString().padStart(2, '0')}`
}
