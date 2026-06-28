import { authedFetch, jsonOrThrow } from './http'
import type { Asset, EditorialState, Job, Rendition } from './types'

export const assetApi = {
  list: () => authedFetch('/api/videos').then(jsonOrThrow<Asset[]>),
  get: (id: string) => authedFetch(`/api/videos/${id}`).then(jsonOrThrow<Asset>),
  jobs: (id: string) => authedFetch(`/api/videos/${id}/jobs`).then(jsonOrThrow<Job[]>),
  renditions: (id: string) =>
    authedFetch(`/api/videos/${id}/renditions`).then(jsonOrThrow<Rendition[]>),
  create: (body: { title: string; description?: string }) =>
    authedFetch('/api/videos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }).then(jsonOrThrow<Asset>),
  upload: (id: string, file: File) => {
    const fd = new FormData()
    fd.append('file', file)
    return authedFetch(`/api/videos/${id}/upload`, { method: 'POST', body: fd }).then(
      jsonOrThrow<Asset>,
    )
  },
  process: (id: string) =>
    authedFetch(`/api/videos/${id}/process`, { method: 'POST' }).then(jsonOrThrow<void>),
  delete: (id: string) =>
    authedFetch(`/api/videos/${id}`, { method: 'DELETE' }).then(jsonOrThrow<void>),
  transitionEditorial: (id: string, target: EditorialState) =>
    authedFetch(`/api/videos/${id}/editorial-state`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target }),
    }).then(jsonOrThrow<Asset>),
  setCategory: (id: string, category: string | null) =>
    authedFetch(`/api/videos/${id}/category`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category }),
    }).then(jsonOrThrow<Asset>),
}
