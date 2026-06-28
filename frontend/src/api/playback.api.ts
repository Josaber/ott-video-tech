import { authedFetch, jsonOrThrow } from './http'
import type { PlaybackSession } from './types'

export const playbackApi = {
  openSession: async (assetId: string): Promise<PlaybackSession | { limit: number; error: 'too_many' }> => {
    const r = await authedFetch(`/api/me/playback-session/${assetId}`, { method: 'POST' })
    if (r.status === 429) {
      const limit = parseInt(r.headers.get('X-Concurrent-Limit') ?? '2', 10)
      return { error: 'too_many', limit }
    }
    return jsonOrThrow<PlaybackSession>(r)
  },
  heartbeatSession: (sessionId: string) =>
    authedFetch(`/api/me/playback-session/${sessionId}/heartbeat`, { method: 'PUT' }),
  closeSession: (sessionId: string) =>
    authedFetch(`/api/me/playback-session/${sessionId}`, { method: 'DELETE' }),
}
