import { MutableRefObject, RefObject, useEffect, useState } from 'react'

export interface AdRegion { start: number; end: number; id: string }

/**
 * Per-ad-region enforcement. Tracks `maxWatched` (the furthest the user
 * has actually played to) and intercepts every seek to:
 *   - block forward seeks PAST an un-watched ad → snap to the ad's start
 *   - kick the user OUT of any ad region they've already watched (they
 *     usually landed via a backward seek and didn't want to re-enter the
 *     already-completed ad)
 *
 * Inputs:
 *   - adRegions: parsed from EXT-X-DATERANGE by the HLS lifecycle hook
 *   - videoRef: the actual <video> element
 *   - maxWatchedRef: a shared ref that other hooks (resume, initial seek)
 *     also bump so we don't fight each other
 *
 * Returns `adActive` for downstream UI gating (speed picker disable,
 * scrub bar, controls bar).
 */
export function useAdGuard(
  videoRef: RefObject<HTMLVideoElement | null>,
  adRegions: AdRegion[],
  maxWatchedRef: MutableRefObject<number>,
  /** Initial adActive from manifest parse — the preroll pod may start at
   *  t=0 and we want the overlay visible BEFORE the first timeupdate fires. */
  seedActive: boolean,
) {
  const [adActive, setAdActive] = useState<boolean>(seedActive)
  // Adopt the seed when it changes (each src change resets adActive in
  // the lifecycle hook, then the manifest parse flips this to true if a
  // preroll sits at t=0).
  useEffect(() => { if (seedActive) setAdActive(true) }, [seedActive])

  useEffect(() => {
    const video = videoRef.current
    if (!video || adRegions.length === 0) return

    const regionAt = (t: number) =>
      adRegions.find((r) => t >= r.start && t < r.end)

    const onTime = () => {
      if (video.currentTime > maxWatchedRef.current) maxWatchedRef.current = video.currentTime
      const r = regionAt(video.currentTime)
      if (r) {
        if (!adActive) setAdActive(true)
      } else if (adActive) {
        setAdActive(false)
      }
    }

    // Unified seek policy. ALL navigation actions (scrub bar, ±10 s
    // buttons, share-link initial seek, hls.js auto-correction, native
    // keyboard) eventually mutate currentTime → fires `seeking`. Doing
    // the check here means there's exactly one place to keep correct.
    const onSeeking = () => {
      const t = video.currentTime
      if (t > maxWatchedRef.current + 0.5) {
        // Block forward seek across an un-watched ad. We use
        // `rg.end > maxWatched && rg.start < t` (not the older
        // `rg.start > maxWatched`) so a forward seek WHILE inside an
        // in-progress ad still gets caught and snapped back to the ad.
        const blocking = adRegions.find((rg) =>
          rg.end > maxWatchedRef.current && rg.start < t
        )
        if (blocking) {
          const newPos = Math.max(blocking.start, maxWatchedRef.current)
          const clamped = Math.min(newPos, blocking.end - 0.1)
          maxWatchedRef.current = Math.max(maxWatchedRef.current, clamped)
          video.currentTime = clamped
          return
        }
      }
      const r = regionAt(t)
      if (r && maxWatchedRef.current >= r.end - 0.1) {
        // Inside an ad we've already finished — push to post-ad.
        const dur = Number.isFinite(video.duration) ? video.duration : r.end + 1
        video.currentTime = Math.min(dur, r.end + 0.05)
      }
    }

    const onKey = (e: KeyboardEvent) => {
      if (regionAt(video.currentTime)) {
        if (['ArrowRight', 'ArrowUp', 'l', 'L', '.', '>'].includes(e.key)) {
          e.preventDefault()
          e.stopPropagation()
        }
      }
    }
    video.addEventListener('timeupdate', onTime)
    video.addEventListener('seeking', onSeeking)
    video.addEventListener('keydown', onKey)
    return () => {
      video.removeEventListener('timeupdate', onTime)
      video.removeEventListener('seeking', onSeeking)
      video.removeEventListener('keydown', onKey)
    }
  }, [adRegions, adActive])

  return [adActive, setAdActive] as const
}
