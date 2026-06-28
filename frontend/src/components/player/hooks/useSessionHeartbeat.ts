import { useEffect } from 'react'
import { api } from '../../../api/client'

/**
 * Heartbeat every 30 s while a playback session is open. Backend reaps
 * any session > 90 s stale on the next session-open attempt.
 */
export function useSessionHeartbeat(sessionId: string | null) {
  useEffect(() => {
    if (!sessionId) return
    const id = window.setInterval(() => {
      api.heartbeatSession(sessionId).catch(() => {})
    }, 30000)
    return () => window.clearInterval(id)
  }, [sessionId])
}
