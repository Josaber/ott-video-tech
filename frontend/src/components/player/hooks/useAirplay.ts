import { RefObject, useEffect, useState } from 'react'

/**
 * Safari-only AirPlay availability detection. We only render the
 * AirPlay button if an output target (Apple TV / HomePod / etc.) is
 * currently visible; the `availability` payload on
 * `webkitplaybacktargetavailabilitychanged` drives that flag.
 *
 * Returns `requestAirplay` so the parent can open the OS picker.
 */
export function useAirplay(videoRef: RefObject<HTMLVideoElement | null>) {
  const [airplayAvailable, setAirplayAvailable] = useState<boolean>(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    interface AirPlayEvent extends Event { availability?: string }
    const handler = (e: Event) => {
      const av = (e as AirPlayEvent).availability
      setAirplayAvailable(av === 'available')
    }
    type WkVideo = HTMLVideoElement & {
      webkitShowPlaybackTargetPicker?: () => void
    }
    const v = video as WkVideo
    if ('webkitShowPlaybackTargetPicker' in v) {
      video.addEventListener('webkitplaybacktargetavailabilitychanged', handler)
    }
    return () => {
      video.removeEventListener('webkitplaybacktargetavailabilitychanged', handler)
    }
  }, [])

  const requestAirplay = () => {
    type WkVideo = HTMLVideoElement & {
      webkitShowPlaybackTargetPicker?: () => void
    }
    const v = videoRef.current as WkVideo | null
    v?.webkitShowPlaybackTargetPicker?.()
  }

  return { airplayAvailable, requestAirplay }
}
