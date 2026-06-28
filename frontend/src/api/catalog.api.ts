import { authedFetch, jsonOrThrow } from './http'
import type { Asset, Season, Series } from './types'

export const catalogApi = {
  listSeries: () =>
    authedFetch('/api/series').then(jsonOrThrow<Series[]>),
  createSeries: (body: { title: string; description?: string }) =>
    authedFetch('/api/series', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }).then(jsonOrThrow<Series>),
  deleteSeries: (id: string) =>
    authedFetch(`/api/series/${id}`, { method: 'DELETE' }).then(jsonOrThrow<void>),
  listSeasons: (seriesId: string) =>
    authedFetch(`/api/series/${seriesId}/seasons`).then(jsonOrThrow<Season[]>),
  createSeason: (seriesId: string, body: { seasonNumber: number; title?: string }) =>
    authedFetch(`/api/series/${seriesId}/seasons`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }).then(jsonOrThrow<Season>),
  deleteSeason: (id: string) =>
    authedFetch(`/api/seasons/${id}`, { method: 'DELETE' }).then(jsonOrThrow<void>),
  setAssetSeries: (assetId: string, body: { seasonId: string | null; episodeNumber: number | null }) =>
    authedFetch(`/api/videos/${assetId}/series`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }).then(jsonOrThrow<Asset>),
  // Returns null when the server replies 204 No Content — no next episode.
  getNextAsset: async (assetId: string): Promise<Asset | null> => {
    const r = await authedFetch(`/api/videos/${assetId}/next`)
    if (r.status === 204) return null
    return jsonOrThrow<Asset>(r)
  },
}
