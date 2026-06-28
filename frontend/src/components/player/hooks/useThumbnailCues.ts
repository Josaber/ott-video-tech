import { useEffect, useState } from 'react'
import { CUE_PATTERN, hmsToSec, ThumbCue } from '../utils'

/**
 * Fetch + parse the trick-play WebVTT cue file. Returns the parsed
 * cues and the resolved sprite-sheet URL (first sprite referenced in
 * the VTT, resolved against thumbnailsUrl).
 */
export function useThumbnailCues(thumbnailsUrl?: string | null) {
  const [cues, setCues] = useState<ThumbCue[]>([])
  const [spriteUrl, setSpriteUrl] = useState<string>('')

  useEffect(() => {
    if (!thumbnailsUrl) {
      setCues([])
      setSpriteUrl('')
      return
    }
    let cancelled = false
    fetch(thumbnailsUrl)
      .then((r) => (r.ok ? r.text() : Promise.reject(new Error('vtt fetch failed'))))
      .then((text) => {
        if (cancelled) return
        const blocks = text.split(/\n\n+/)
        const parsed: ThumbCue[] = []
        let firstSprite = ''
        for (const block of blocks) {
          const m = CUE_PATTERN.exec(block)
          if (!m) continue
          const start = hmsToSec(m[1], m[2], m[3])
          const end = hmsToSec(m[4], m[5], m[6])
          const sprite = m[7]
          if (!firstSprite) firstSprite = sprite
          parsed.push({
            start, end, sprite,
            x: parseInt(m[8], 10),
            y: parseInt(m[9], 10),
            w: parseInt(m[10], 10),
            h: parseInt(m[11], 10),
          })
        }
        setCues(parsed)
        if (firstSprite) {
          const base = new URL(thumbnailsUrl, window.location.href)
          setSpriteUrl(new URL(firstSprite, base).toString())
        }
      })
      .catch(() => {
        if (!cancelled) {
          setCues([])
          setSpriteUrl('')
        }
      })
    return () => { cancelled = true }
  }, [thumbnailsUrl])

  return { cues, spriteUrl }
}
