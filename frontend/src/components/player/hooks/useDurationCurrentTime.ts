import { RefObject, useEffect, useState } from 'react'

/**
 * Mirror video.duration and video.currentTime into React state so the
 * trick-play strip can render a progress bar and a hover preview.
 * Listens to loadedmetadata + durationchange + timeupdate.
 */
export function useDurationCurrentTime(videoRef: RefObject<HTMLVideoElement | null>) {
  const [duration, setDuration] = useState<number>(0)
  const [currentTime, setCurrentTime] = useState<number>(0)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    const onMeta = () => setDuration(video.duration || 0)
    const onTime = () => setCurrentTime(video.currentTime)
    video.addEventListener('loadedmetadata', onMeta)
    video.addEventListener('durationchange', onMeta)
    video.addEventListener('timeupdate', onTime)
    return () => {
      video.removeEventListener('loadedmetadata', onMeta)
      video.removeEventListener('durationchange', onMeta)
      video.removeEventListener('timeupdate', onTime)
    }
  }, [])

  return { duration, currentTime }
}
