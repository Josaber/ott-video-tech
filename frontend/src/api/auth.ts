const TOKEN_KEY = 'ott-demo:token'
const USER_KEY = 'ott-demo:user'

export interface AuthSession {
  token: string
  username: string
  role: string
}

const listeners = new Set<() => void>()

export function getSession(): AuthSession | null {
  const token = localStorage.getItem(TOKEN_KEY)
  const raw = localStorage.getItem(USER_KEY)
  if (!token || !raw) return null
  try {
    const u = JSON.parse(raw) as { username: string; role: string }
    return { token, username: u.username, role: u.role }
  } catch {
    return null
  }
}

export function setSession(s: AuthSession) {
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
  return localStorage.getItem(TOKEN_KEY)
}
