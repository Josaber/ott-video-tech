import { MutableRefObject, RefObject, useEffect } from 'react'
import { PREROLL_OFFSET_SEC } from '../utils'

/**
 * Apply a share-at-timestamp initial seek once `loadedmetadata` fires.
 * The `initialSeekSeconds` value is PROGRAM time (what the user shared);
 * we add the preroll-pod offset so the playhead lands in the right spot
 * on the stitched timeline.
 *
 * `maxWatchedRef` is updated so the ad guard knows the user has already
 * advanced past those program seconds.
 */
export function useInitialSeek(
  videoRef: RefObject<HTMLVideoElement | null>,
  maxWatchedRef: MutableRefObject<number>,
  src: string,
  initialSeekSeconds?: number,
) {
  useEffect(() => {
    if (!initialSeekSeconds || initialSeekSeconds <= 0) return
    const video = videoRef.current
    if (!video) return
    const apply = () => {
      video.currentTime = initialSeekSeconds + PREROLL_OFFSET_SEC
      maxWatchedRef.current = video.currentTime
    }
    if (video.readyState >= 1) apply()
    video.addEventListener('loadedmetadata', apply, { once: true })
    return () => video.removeEventListener('loadedmetadata', apply)
  }, [initialSeekSeconds, src])
}
