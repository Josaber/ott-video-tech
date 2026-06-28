import { useEffect, useRef, useState } from 'react'
import { api } from '../../../api/client'

/**
 * Acquire a per-mount playback session against the backend. Backend
 * caps concurrent streams per user; if we're over, we record the limit
 * and the parent renders the StreamLimitOverlay instead of the video.
 *
 * Caller is expected to gate the HLS setup effect on (sessionId || sessionError).
 */
export function usePlaybackSession(assetId?: string) {
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [sessionError, setSessionError] = useState<{ limit: number } | null>(null)
  const sessionPending = useRef<boolean>(false)

  useEffect(() => {
    if (!assetId) return
    sessionPending.current = true
    setSessionId(null)
    setSessionError(null)
    let cancelled = false
    let acquiredId: string | null = null
    api.openSession(assetId).then((result) => {
      if (cancelled) {
        if ('sessionId' in result) {
          api.closeSession(result.sessionId).catch(() => {})
        }
        return
      }
      if ('error' in result) {
        setSessionError({ limit: result.limit })
      } else {
        acquiredId = result.sessionId
        setSessionId(result.sessionId)
      }
    }).catch(() => {
      if (!cancelled) setSessionError({ limit: 2 })
    }).finally(() => {
      sessionPending.current = false
    })
    return () => {
      cancelled = true
      if (acquiredId) api.closeSession(acquiredId).catch(() => {})
    }
  }, [assetId])

  return { sessionId, sessionError }
}
