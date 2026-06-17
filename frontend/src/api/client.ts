import { clearSession, getToken, setSession } from './auth'

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

export interface LoginResponse {
  accessToken: string
  tokenType: string
  expiresInSeconds: number
  username: string
  role: string
}

function authHeaders(extra: Record<string, string> = {}): Record<string, string> {
  const token = getToken()
  return token ? { Authorization: `Bearer ${token}`, ...extra } : extra
}

async function jsonOrThrow<T>(r: Response): Promise<T> {
  if (r.status === 401) {
    clearSession()
    throw new Error('unauthenticated')
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
  setSession({ token: body.accessToken, username: body.username, role: body.role })
  return body
}

export const api = {
  login: (username: string, password: string) =>
    loginLike('/auth/login', { username, password }),
  register: (username: string, password: string) =>
    loginLike('/auth/register', { username, password }),
  changePassword: async (currentPassword: string, newPassword: string) => {
    const r = await fetch('/auth/change-password', {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ currentPassword, newPassword }),
    })
    if (r.status === 401) throw new Error('invalid_credentials')
    if (r.status === 409) throw new Error('same_as_current')
    if (!r.ok) throw new Error(await r.text())
  },
  list: () => fetch('/api/videos', { headers: authHeaders() }).then(jsonOrThrow<Asset[]>),
  get: (id: string) =>
    fetch(`/api/videos/${id}`, { headers: authHeaders() }).then(jsonOrThrow<Asset>),
  jobs: (id: string) =>
    fetch(`/api/videos/${id}/jobs`, { headers: authHeaders() }).then(jsonOrThrow<Job[]>),
  create: (body: { title: string; description?: string }) =>
    fetch('/api/videos', {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(body),
    }).then(jsonOrThrow<Asset>),
  upload: (id: string, file: File) => {
    const fd = new FormData()
    fd.append('file', file)
    return fetch(`/api/videos/${id}/upload`, {
      method: 'POST',
      headers: authHeaders(),
      body: fd,
    }).then(jsonOrThrow<Asset>)
  },
  process: (id: string) =>
    fetch(`/api/videos/${id}/process`, {
      method: 'POST',
      headers: authHeaders(),
    }).then(jsonOrThrow<void>),
}
