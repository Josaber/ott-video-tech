import { RefObject, useEffect, useRef } from 'react'

/**
 * Web Audio DelayNode that delays the AUDIO branch by `audioSyncMs`.
 * Positive only — negative would need video delay too, which the
 * browser doesn't expose. UI is clamped to 0..500 ms.
 *
 * Side effect on `audioSyncMs` change:
 *   - 0 → close the AudioContext (audio plays through the native graph)
 *   - >0 → ensure ctx + DelayNode exist, set delayTime
 */
export function useAudioSyncDelay(
  videoRef: RefObject<HTMLVideoElement | null>,
  audioSyncMs: number,
  src: string,
) {
  const audioCtxRef = useRef<{ ctx: AudioContext; delay: DelayNode } | null>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    if (audioSyncMs <= 0) {
      if (audioCtxRef.current) {
        audioCtxRef.current.ctx.close().catch(() => {})
        audioCtxRef.current = null
      }
      return
    }
    if (!audioCtxRef.current) {
      try {
        const AC: typeof AudioContext =
          (window as unknown as { AudioContext: typeof AudioContext; webkitAudioContext?: typeof AudioContext })
            .AudioContext ??
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
        const ctx = new AC()
        const source = ctx.createMediaElementSource(video)
        const delay = ctx.createDelay(2)
        source.connect(delay).connect(ctx.destination)
        audioCtxRef.current = { ctx, delay }
      } catch {
        // createMediaElementSource throws if called twice on the same
        // element. Bail; user will see the slider not work but no crash.
        return
      }
    }
    audioCtxRef.current.delay.delayTime.value = audioSyncMs / 1000
    localStorage.setItem('hls-player-audio-sync-ms', String(audioSyncMs))
  }, [audioSyncMs, src])
}
