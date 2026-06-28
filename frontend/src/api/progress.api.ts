import { authedFetch, jsonOrThrow } from './http'
import type { ContinueWatchingItem, WatchProgress } from './types'

export const progressApi = {
  continueWatching: () =>
    authedFetch('/api/me/progress/recent').then(jsonOrThrow<ContinueWatchingItem[]>),
  getProgress: async (assetId: string): Promise<WatchProgress | null> => {
    const r = await authedFetch(`/api/me/progress/${assetId}`)
    if (r.status === 204 || r.status === 404) return null
    return jsonOrThrow<WatchProgress>(r)
  },
  putProgress: (assetId: string, body: { positionMs: number; durationMs?: number | null }) =>
    authedFetch(`/api/me/progress/${assetId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }).then(jsonOrThrow<WatchProgress>),
  deleteProgress: (assetId: string) =>
    authedFetch(`/api/me/progress/${assetId}`, { method: 'DELETE' }).then(jsonOrThrow<void>),
}
