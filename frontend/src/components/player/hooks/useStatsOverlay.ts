import { MutableRefObject, RefObject, useEffect, useState } from 'react'
import Hls from 'hls.js'
import { PlayerStats } from '../StatsOverlay'

/**
 * Poll hls.js + the native video element every 500 ms for the stats
 * panel. Only runs when the user has the panel open — when closed,
 * we drop the interval and `null` the state.
 */
export function useStatsOverlay(
  videoRef: RefObject<HTMLVideoElement | null>,
  hlsRef: RefObject<Hls | undefined>,
  fragsLoadedRef: MutableRefObject<number>,
  open: boolean,
) {
  const [stats, setStats] = useState<PlayerStats | null>(null)

  useEffect(() => {
    if (!open) {
      setStats(null)
      return
    }
    const id = window.setInterval(() => {
      const video = videoRef.current
      const h = hlsRef.current
      if (!video) return
      const buffered = video.buffered
      const tail = buffered.length > 0 ? buffered.end(buffered.length - 1) : video.currentTime
      const bufferAhead = Math.max(0, tail - video.currentTime)
      const q = typeof video.getVideoPlaybackQuality === 'function'
        ? video.getVideoPlaybackQuality()
        : null
      setStats({
        bandwidthKbps: h ? Math.round(h.bandwidthEstimate / 1000) : 0,
        currentLevel: h ? h.currentLevel : -1,
        fragsLoaded: fragsLoadedRef.current,
        droppedFrames: q?.droppedVideoFrames ?? 0,
        decodedFrames: q?.totalVideoFrames ?? 0,
        bufferAheadSec: bufferAhead,
        latencySec: h && h.latency != null ? h.latency : null,
      })
    }, 500)
    return () => window.clearInterval(id)
  }, [open])

  return stats
}
