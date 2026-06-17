export type AssetStatus = 'UNPUBLISHED' | 'PROCESSING' | 'PUBLISHED' | 'FAILED'

export interface Asset {
  id: string
  title: string
  description: string | null
  status: AssetStatus
  rawUploaded: boolean
  playbackUrl: string | null
  drmKeyIdPreview: string | null
  adId: string | null
  adDurationMs: number | null
  createdAt: string
  updatedAt: string
}

export interface Job {
  id: string
  assetId: string
  stage: 'UPLOAD' | 'TRANSCODE' | 'PACKAGE' | 'SSAI' | 'DRM' | 'PUBLISH'
  status: 'PENDING' | 'RUNNING' | 'SUCCEEDED' | 'FAILED'
  message: string | null
  startedAt: string | null
  finishedAt: string | null
  updatedAt: string
}

async function jsonOrThrow<T>(r: Response): Promise<T> {
  if (!r.ok) {
    const body = await r.text()
    throw new Error(body || r.statusText)
  }
  if (r.status === 204) return undefined as unknown as T
  return r.json() as Promise<T>
}

export const api = {
  list: () => fetch('/api/videos').then(jsonOrThrow<Asset[]>),
  get: (id: string) => fetch(`/api/videos/${id}`).then(jsonOrThrow<Asset>),
  jobs: (id: string) => fetch(`/api/videos/${id}/jobs`).then(jsonOrThrow<Job[]>),
  create: (body: { title: string; description?: string }) =>
    fetch('/api/videos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }).then(jsonOrThrow<Asset>),
  upload: (id: string, file: File) => {
    const fd = new FormData()
    fd.append('file', file)
    return fetch(`/api/videos/${id}/upload`, { method: 'POST', body: fd }).then(jsonOrThrow<Asset>)
  },
  process: (id: string) =>
    fetch(`/api/videos/${id}/process`, { method: 'POST' }).then(jsonOrThrow<void>),
}
