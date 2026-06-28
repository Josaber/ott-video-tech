import { useMemo, useRef } from 'react'
import { clampPreview, fmt, ThumbCue } from './utils'

/**
 * Below-player scrub bar that:
 *   - shows a progress fill
 *   - on hover: renders the sprite thumbnail at that timestamp
 *   - on click: seeks via the provided `onSeek` callback (which the
 *     parent gates through its `onSeeking` ad-region guard)
 */
export function TrickPlayStrip({
  cues,
  spriteUrl,
  currentTime,
  duration,
  onSeek,
}: {
  cues: ThumbCue[]
  spriteUrl: string
  currentTime: number
  duration: number
  onSeek: (timeSec: number) => void
}) {
  const stripRef = useRef<HTMLDivElement>(null)
  // Local hover state — there's no reason the player needs to know
  // where the cursor is on the strip.
  const hover = useHoverState()

  const hoverCue = useMemo(() => {
    if (!hover.state) return null
    return cues.find((c) => hover.state!.time >= c.start && hover.state!.time < c.end) ?? null
  }, [hover.state, cues])

  if (cues.length === 0 || !spriteUrl) return null

  const progressPct = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    if (duration <= 0) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left))
    const t = (x / rect.width) * duration
    hover.set({ x, time: t })
  }

  function onLeave() { hover.set(null) }

  function onClick(e: React.MouseEvent<HTMLDivElement>) {
    if (duration <= 0) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left))
    onSeek((x / rect.width) * duration)
  }

  return (
    <div
      ref={stripRef}
      className="trickplay-strip"
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      onClick={onClick}
    >
      <div className="trickplay-track">
        <div className="trickplay-progress" style={{ width: `${progressPct}%` }} />
      </div>
      <div className="trickplay-label">
        <span>trick-play</span>
        <span>{fmt(currentTime)} / {fmt(duration)}</span>
      </div>
      {hover.state && hoverCue && (
        <div
          className="trickplay-preview"
          style={{ left: clampPreview(hover.state.x, stripRef.current?.clientWidth ?? 0, hoverCue.w) }}
        >
          <div
            className="trickplay-thumb"
            style={{
              width: hoverCue.w,
              height: hoverCue.h,
              backgroundImage: `url(${spriteUrl})`,
              backgroundPosition: `-${hoverCue.x}px -${hoverCue.y}px`,
            }}
          />
          <div className="trickplay-time">{fmt(hover.state.time)}</div>
        </div>
      )}
    </div>
  )
}

import { useState } from 'react'

function useHoverState() {
  const [state, set] = useState<{ x: number; time: number } | null>(null)
  return { state, set }
}
