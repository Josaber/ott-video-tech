import { MutableRefObject, RefObject, useEffect, useRef, useState } from 'react'
import { api } from '../../../api/client'
import { FINISHED_TAIL_SEC, RESUME_MIN_SEC } from '../utils'

/**
 * Bundles two halves of watch-progress: resume on load + autosave every
 * 10 s + on pause/unmount. Kept together because they share state
 * (`lastSavedMs` and `resumeApplied` refs) and the lifetime is shared
 * (both are scoped to `(assetId, src)`).
 *
 * Returns `resumedFrom` so the parent can show a "resumed at 1:23"
 * tooltip; also returns the `maxWatchedRef` it touches at resume so the
 * ad guard knows the user has progressed past any region before that.
 */
export function useWatchProgress(
  videoRef: RefObject<HTMLVideoElement | null>,
  maxWatchedRef: MutableRefObject<number>,
  assetId: string | undefined,
  src: string,
) {
  const [resumedFrom, setResumedFrom] = useState<number | null>(null)
  const resumeApplied = useRef<boolean>(false)
  const lastSavedMs = useRef<number>(-1)

  // Resume from saved position. Wait for loadedmetadata so currentTime
  // assignment actually sticks (Safari ignores seeks on a freshly attached
  // source). Skip resume if no assetId — caller hasn't opted in.
  useEffect(() => {
    if (!assetId) return
    const video = videoRef.current
    if (!video) return
    resumeApplied.current = false
    setResumedFrom(null)
    lastSavedMs.current = -1
    let cancelled = false
    let savedMs: number | null = null
    api.getProgress(assetId).then((p) => {
      if (cancelled || !p) return
      savedMs = p.positionMs
      tryResume()
    }).catch(() => {})

    const tryResume = () => {
      if (resumeApplied.current || savedMs == null || cancelled) return
      const v = videoRef.current
      if (!v) return
      if (!v.duration || !Number.isFinite(v.duration)) return
      const totalSec = v.duration
      const savedSec = savedMs / 1000
      if (savedSec < RESUME_MIN_SEC) {
        resumeApplied.current = true
        return
      }
      if (totalSec > 0 && savedSec > totalSec - FINISHED_TAIL_SEC) {
        resumeApplied.current = true
        return
      }
      v.currentTime = savedSec
      maxWatchedRef.current = savedSec
      setResumedFrom(savedSec)
      resumeApplied.current = true
    }
    const onMeta = () => tryResume()
    video.addEventListener('loadedmetadata', onMeta)
    if (video.readyState >= 1) tryResume()
    return () => {
      cancelled = true
      video.removeEventListener('loadedmetadata', onMeta)
    }
  }, [assetId, src])

  // Autosave: every 10 s, plus on pause and on unmount. Dedup repeated
  // saves of the same second.
  useEffect(() => {
    if (!assetId) return
    const video = videoRef.current
    if (!video) return
    const save = (force = false) => {
      const t = video.currentTime
      if (!Number.isFinite(t) || t < 0) return
      const ms = Math.round(t * 1000)
      if (!force && Math.abs(ms - lastSavedMs.current) < 1000) return
      lastSavedMs.current = ms
      const dMs = Number.isFinite(video.duration) ? Math.round(video.duration * 1000) : null
      api.putProgress(assetId, { positionMs: ms, durationMs: dMs }).catch(() => {})
    }
    const interval = window.setInterval(() => {
      if (!video.paused && !video.ended) save()
    }, 10000)
    const onPause = () => save(true)
    const onEnded = () => {
      // Treat as finished — save 0 so next visit doesn't resume at the tail.
      lastSavedMs.current = 0
      api.putProgress(assetId, { positionMs: 0, durationMs: null }).catch(() => {})
    }
    video.addEventListener('pause', onPause)
    video.addEventListener('ended', onEnded)
    return () => {
      window.clearInterval(interval)
      video.removeEventListener('pause', onPause)
      video.removeEventListener('ended', onEnded)
      save(true)
    }
  }, [assetId])

  return { resumedFrom }
}
