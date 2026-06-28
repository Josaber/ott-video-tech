import { clearSession, getRefreshToken, getToken, setSession } from './auth'
import type { LoginResponse } from './types'

// Shared HTTP helpers used by every domain-specific API module.
// Centralising these here means the 401 → refresh → retry dance and the
// jsonOrThrow status-code policy live in exactly one place — domain
// modules only describe shape (URL + payload) and let the helpers handle
// auth and error translation.

export function authHeaders(extra: Record<string, string> = {}): Record<string, string> {
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

export async function authedFetch(input: string, init: RequestInit = {}): Promise<Response> {
  let r = await fetch(input, { ...init, headers: { ...(init.headers ?? {}), ...authHeaders() } })
  if (r.status === 401 && (await tryRefresh())) {
    r = await fetch(input, { ...init, headers: { ...(init.headers ?? {}), ...authHeaders() } })
  }
  return r
}

export async function jsonOrThrow<T>(r: Response): Promise<T> {
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

/**
 * Login + register share an "install session, throw on bad creds" shape.
 * Used by auth.api.ts; exposed here so /auth/login and /auth/register
 * call sites don't reimplement the response handling.
 */
export async function loginLike(endpoint: string, payload: object): Promise<LoginResponse> {
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
