const TOKEN_KEY = 'ott-demo:token'
const REFRESH_KEY = 'ott-demo:refresh'
const USER_KEY = 'ott-demo:user'

export interface AuthSession {
  token: string
  refreshToken: string | null
  username: string
  role: string
  expiresAtMs: number
}

const listeners = new Set<() => void>()

function decodeExp(token: string): number | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const payload = JSON.parse(
      atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')),
    ) as { exp?: number }
    return typeof payload.exp === 'number' ? payload.exp : null
  } catch {
    return null
  }
}

function isExpired(token: string): boolean {
  const exp = decodeExp(token)
  return exp !== null && exp * 1000 <= Date.now()
}

export function getSession(): AuthSession | null {
  const token = localStorage.getItem(TOKEN_KEY)
  const raw = localStorage.getItem(USER_KEY)
  if (!token || !raw) return null
  if (isExpired(token)) {
    // Access token is dead. If we still have a usable refresh token, leave the
    // session metadata in place so the API client can transparently refresh.
    const refresh = localStorage.getItem(REFRESH_KEY)
    if (!refresh || isExpired(refresh)) {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(REFRESH_KEY)
      localStorage.removeItem(USER_KEY)
      return null
    }
  }
  try {
    const u = JSON.parse(raw) as { username: string; role: string }
    const exp = decodeExp(token)
    return {
      token,
      refreshToken: localStorage.getItem(REFRESH_KEY),
      username: u.username,
      role: u.role,
      expiresAtMs: exp !== null ? exp * 1000 : 0,
    }
  } catch {
    return null
  }
}

export function setSession(s: {
  token: string
  refreshToken: string
  username: string
  role: string
}) {
  localStorage.setItem(TOKEN_KEY, s.token)
  localStorage.setItem(REFRESH_KEY, s.refreshToken)
  localStorage.setItem(USER_KEY, JSON.stringify({ username: s.username, role: s.role }))
  listeners.forEach((l) => l())
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(REFRESH_KEY)
  localStorage.removeItem(USER_KEY)
  listeners.forEach((l) => l())
}

/**
 * Update the cached username/role for the current session without
 * touching the tokens. Used when /auth/me returns a different role
 * (e.g. an admin demoted this user between token refreshes).
 */
export function updateProfile(username: string, role: string) {
  localStorage.setItem(USER_KEY, JSON.stringify({ username, role }))
  listeners.forEach((l) => l())
}

export function onSessionChange(fn: () => void): () => void {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export function getToken(): string | null {
  const token = localStorage.getItem(TOKEN_KEY)
  if (!token) return null
  if (isExpired(token)) return null
  return token
}

export function getRefreshToken(): string | null {
  const t = localStorage.getItem(REFRESH_KEY)
  if (!t || isExpired(t)) return null
  return t
}
