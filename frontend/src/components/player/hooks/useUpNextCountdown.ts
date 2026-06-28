import { RefObject, useEffect, useState } from 'react'

/**
 * During the last 15 s of playback, show the Up Next teaser with a
 * 10-second countdown auto-roll. State resets when `src` changes (new
 * asset → new chance to skip the teaser).
 *
 * The `onPlay` argument is invoked when the countdown hits zero.
 */
export function useUpNextCountdown(
  videoRef: RefObject<HTMLVideoElement | null>,
  src: string,
  upNext: { onPlay: () => void } | null | undefined,
) {
  const [active, setActive] = useState<boolean>(false)
  const [countdown, setCountdown] = useState<number>(10)
  const [cancelled, setCancelled] = useState<boolean>(false)

  // Per-asset reset.
  useEffect(() => {
    setActive(false)
    setCancelled(false)
    setCountdown(10)
  }, [src])

  // Detect "we're in the trailing 15 s" — re-evaluate as time advances.
  useEffect(() => {
    const video = videoRef.current
    if (!video || !upNext || cancelled) return
    const onTime = () => {
      const dur = video.duration
      if (!Number.isFinite(dur) || dur <= 0) return
      const remaining = dur - video.currentTime
      if (remaining <= 15 && !active) {
        setActive(true)
        setCountdown(10)
      } else if (remaining > 15 && active) {
        setActive(false)
      }
    }
    video.addEventListener('timeupdate', onTime)
    return () => video.removeEventListener('timeupdate', onTime)
  }, [upNext, active, cancelled])

  // 10 → 9 → 8 ... → 0, then trigger onPlay.
  useEffect(() => {
    if (!active || !upNext) return
    if (countdown <= 0) {
      upNext.onPlay()
      setActive(false)
      return
    }
    const t = window.setTimeout(() => setCountdown((n) => n - 1), 1000)
    return () => window.clearTimeout(t)
  }, [active, countdown, upNext])

  return {
    active,
    countdown,
    dismiss: () => { setCancelled(true); setActive(false) },
    playNow: () => { setActive(false); upNext?.onPlay() },
  }
}
