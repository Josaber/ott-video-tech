import { RefObject, useEffect, useState } from 'react'

/**
 * Track the user's chosen playback rate separately from the video
 * element's actual `playbackRate`. The ad guard forces 1× during ad
 * regions; without this split, picking 1.5× would get nuked on entering
 * a preroll and never restored when the ad ends.
 *
 * Returns:
 *   - pinnedSpeed: the user's intent (drives the dropdown)
 *   - setPinnedSpeed
 * Side effect: keeps video.playbackRate in sync with intent when not
 * in an ad region, forces 1× when adActive.
 */
export function usePinnedSpeed(
  videoRef: RefObject<HTMLVideoElement | null>,
  adActive: boolean,
) {
  const [pinnedSpeed, setPinnedSpeed] = useState<number>(1)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    const target = adActive ? 1 : pinnedSpeed
    if (Math.abs(video.playbackRate - target) > 0.01) {
      video.playbackRate = target
    }
  }, [pinnedSpeed, adActive])

  return [pinnedSpeed, setPinnedSpeed] as const
}
