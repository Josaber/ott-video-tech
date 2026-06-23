import { clearSession, getRefreshToken, getToken, setSession } from './auth'

export type AssetStatus = 'UNPUBLISHED' | 'PROCESSING' | 'PUBLISHED' | 'FAILED'

export interface Asset {
  id: string
  title: string
  description: string | null
  status: AssetStatus
  rawUploaded: boolean
  playbackUrl: string | null
  thumbnailsUrl: string | null
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

export interface LoginResponse {
  accessToken: string
  refreshToken: string
  tokenType: string
  expiresInSeconds: number
  refreshExpiresInSeconds: number
  username: string
  role: string
}

function authHeaders(extra: Record<string, string> = {}): Record<string, string> {
  const token = getToken()
  return token ? { Authorization: `Bearer ${token}`, ...extra } : extra
}

let inflightRefresh: Promise<boolean> | null = null

async function tryRefresh(): Promise<boolean> {
  if (inflightRefresh) return inflightRefresh
  const refreshToken = getRefreshToken()
  if (!refreshToken) return false
  inflightRefresh = (async () => {
    try {
      const r = await fetch('/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      })
      if (!r.ok) return false
      const body = (await r.json()) as LoginResponse
      setSession({
        token: body.accessToken,
        refreshToken: body.refreshToken,
        username: body.username,
        role: body.role,
      })
      return true
    } catch {
      return false
    } finally {
      inflightRefresh = null
    }
  })()
  return inflightRefresh
}

async function authedFetch(input: string, init: RequestInit = {}): Promise<Response> {
  let r = await fetch(input, { ...init, headers: { ...(init.headers ?? {}), ...authHeaders() } })
  if (r.status === 401 && (await tryRefresh())) {
    r = await fetch(input, { ...init, headers: { ...(init.headers ?? {}), ...authHeaders() } })
  }
  return r
}

async function jsonOrThrow<T>(r: Response): Promise<T> {
  if (r.status === 401) {
    clearSession()
    throw new Error('unauthenticated')
  }
  if (r.status === 403) {
    throw new Error('forbidden')
  }
  if (!r.ok) {
    const body = await r.text()
    throw new Error(body || r.statusText)
  }
  if (r.status === 204) return undefined as unknown as T
  return r.json() as Promise<T>
}

async function loginLike(endpoint: string, payload: object): Promise<LoginResponse> {
  const r = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (r.status === 401) throw new Error('invalid_credentials')
  if (r.status === 409) throw new Error('username_taken')
  if (!r.ok) throw new Error(await r.text())
  const body = (await r.json()) as LoginResponse
  setSession({
    token: body.accessToken,
    refreshToken: body.refreshToken,
    username: body.username,
    role: body.role,
  })
  return body
}

export interface MeResponse {
  username: string
  role: string
}

export const api = {
  login: (username: string, password: string) =>
    loginLike('/auth/login', { username, password }),
  register: (username: string, password: string) =>
    loginLike('/auth/register', { username, password }),
  me: () => authedFetch('/auth/me').then(jsonOrThrow<MeResponse>),
  changePassword: async (currentPassword: string, newPassword: string) => {
    const r = await authedFetch('/auth/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword, newPassword }),
    })
    if (r.status === 401) throw new Error('invalid_credentials')
    if (r.status === 409) throw new Error('same_as_current')
    if (!r.ok) throw new Error(await r.text())
    // Backend rotates token_version, which would 401 every subsequent
    // request from THIS tab too. The response carries a fresh access +
    // refresh pair stamped with the new tv; install them.
    const body = (await r.json()) as LoginResponse
    setSession({
      token: body.accessToken,
      refreshToken: body.refreshToken,
      username: body.username,
      role: body.role,
    })
  },
  list: () => authedFetch('/api/videos').then(jsonOrThrow<Asset[]>),
  get: (id: string) => authedFetch(`/api/videos/${id}`).then(jsonOrThrow<Asset>),
  jobs: (id: string) => authedFetch(`/api/videos/${id}/jobs`).then(jsonOrThrow<Job[]>),
  renditions: (id: string) =>
    authedFetch(`/api/videos/${id}/renditions`).then(jsonOrThrow<Rendition[]>),
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
  liveChannels: () =>
    fetch('/api/live/channels').then((r) => r.json() as Promise<LiveChannel[]>),
  cmcdRecent: () =>
    authedFetch('/api/cmcd/recent').then(jsonOrThrow<CmcdEvent[]>),
  liveStart: () =>
    authedFetch('/api/live/start', { method: 'POST' }).then(jsonOrThrow<{ running: boolean }>),
  liveStop: () =>
    authedFetch('/api/live/stop', { method: 'POST' }).then(jsonOrThrow<{ running: boolean }>),
}

export interface LiveChannel {
  slug: string
  name: string
  description: string
  running: boolean
  startedAt: string
  source: string
  manifestUrl: string
}

export interface CmcdEvent {
  path: string
  timestamp: number
  ingestedAt?: string
  cmcd: Record<string, string | number | boolean>
}

export interface WatchProgress {
  assetId: string
  positionMs: number
  durationMs: number | null
  updatedAt: string
}

export interface Rendition {
  tier: string
  width: number
  height: number
  videoBitrateKbps: number
  audioBitrateKbps: number
  vmafScore: number | null
  convexHullOptimal: boolean | null
}

export interface PlaybackSession {
  sessionId: string
  assetId: string
  activeCount: number
  limit: number
}
