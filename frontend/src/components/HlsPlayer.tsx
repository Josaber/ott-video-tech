import { useEffect, useRef, useState } from 'react'
import Hls from 'hls.js'

interface Props {
  src: string
}

/**
 * Player with ad-not-skippable enforcement:
 *   - reads ad duration from #EXT-X-DATERANGE on the loaded manifest
 *   - while currentTime < adEndTime:
 *       * pulls seeks back to maxWatched
 *       * blocks playbackRate > 1
 *       * intercepts key events that would seek forward
 *   - records maxWatched so a backward seek that re-enters the ad still ends up at adEndTime once you cross out
 */
export function HlsPlayer({ src }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [adEnd, setAdEnd] = useState<number>(0)
  const [adActive, setAdActive] = useState<boolean>(false)
  const maxWatched = useRef<number>(0)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    maxWatched.current = 0
    setAdEnd(0)
    setAdActive(false)

    let hls: Hls | undefined
    if (Hls.isSupported()) {
      hls = new Hls({ debug: false })
      hls.loadSource(src)
      hls.attachMedia(video)
      hls.on(Hls.Events.MANIFEST_PARSED, (_e, data) => {
        const duration = extractAdDuration(data)
        if (duration > 0) {
          setAdEnd(duration)
          setAdActive(true)
        }
      })
      hls.on(Hls.Events.LEVEL_LOADED, (_e, data) => {
        const rawManifest = (data as { details: { fragments: unknown[] } }).details
        const fragments = rawManifest.fragments as { tagList?: string[][] }[]
        const dateRange = fragments
          .flatMap((f) => f.tagList ?? [])
          .find((t) => Array.isArray(t) && t[0] === 'EXT-X-DATERANGE')
        if (dateRange) {
          const match = /DURATION=([0-9.]+)/.exec(dateRange[1] ?? '')
          if (match) {
            const d = parseFloat(match[1])
            if (d > 0) {
              setAdEnd(d)
              setAdActive(true)
            }
          }
        }
      })
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src
    }
    return () => {
      hls?.destroy()
    }
  }, [src])

  useEffect(() => {
    const video = videoRef.current
    if (!video || adEnd <= 0) return

    const onTime = () => {
      if (video.currentTime < adEnd) {
        if (video.currentTime > maxWatched.current) {
          maxWatched.current = video.currentTime
        }
        if (video.playbackRate > 1) {
          video.playbackRate = 1
        }
        if (!adActive) setAdActive(true)
      } else if (adActive) {
        setAdActive(false)
      }
    }
    const onSeeking = () => {
      if (video.currentTime < adEnd && video.currentTime > maxWatched.current + 0.5) {
        video.currentTime = maxWatched.current
      }
    }
    const onRateChange = () => {
      if (video.currentTime < adEnd && video.playbackRate > 1) {
        video.playbackRate = 1
      }
    }
    const onKey = (e: KeyboardEvent) => {
      if (video.currentTime < adEnd) {
        if (['ArrowRight', 'ArrowUp', 'l', 'L', '.', '>'].includes(e.key)) {
          e.preventDefault()
          e.stopPropagation()
        }
      }
    }
    video.addEventListener('timeupdate', onTime)
    video.addEventListener('seeking', onSeeking)
    video.addEventListener('ratechange', onRateChange)
    video.addEventListener('keydown', onKey)
    return () => {
      video.removeEventListener('timeupdate', onTime)
      video.removeEventListener('seeking', onSeeking)
      video.removeEventListener('ratechange', onRateChange)
      video.removeEventListener('keydown', onKey)
    }
  }, [adEnd, adActive])

  return (
    <div className="video-wrap">
      {adActive && <div className="ad-overlay">AD · NOT SKIPPABLE</div>}
      <video ref={videoRef} controls playsInline />
    </div>
  )
}

function extractAdDuration(data: unknown): number {
  const d = data as { dateRanges?: Record<string, { duration?: number }> } | undefined
  if (!d?.dateRanges) return 0
  for (const id of Object.keys(d.dateRanges)) {
    const dr = d.dateRanges[id]
    if (dr?.duration && dr.duration > 0) return dr.duration
  }
  return 0
}
