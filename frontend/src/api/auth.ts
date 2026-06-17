const TOKEN_KEY = 'ott-demo:token'
const USER_KEY = 'ott-demo:user'

export interface AuthSession {
  token: string
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
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    return null
  }
  try {
    const u = JSON.parse(raw) as { username: string; role: string }
    const exp = decodeExp(token)
    return {
      token,
      username: u.username,
      role: u.role,
      expiresAtMs: exp !== null ? exp * 1000 : 0,
    }
  } catch {
    return null
  }
}

export function setSession(s: Omit<AuthSession, 'expiresAtMs'>) {
  localStorage.setItem(TOKEN_KEY, s.token)
  localStorage.setItem(USER_KEY, JSON.stringify({ username: s.username, role: s.role }))
  listeners.forEach((l) => l())
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
  listeners.forEach((l) => l())
}

export function onSessionChange(fn: () => void): () => void {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export function getToken(): string | null {
  const token = localStorage.getItem(TOKEN_KEY)
  if (!token) return null
  if (isExpired(token)) {
    clearSession()
    return null
  }
  return token
}
