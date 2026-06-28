import { setSession } from './auth'
import { authedFetch, loginLike } from './http'
import type { LoginResponse, MeResponse } from './types'

export const authApi = {
  login: (username: string, password: string) =>
    loginLike('/auth/login', { username, password }),
  register: (username: string, password: string) =>
    loginLike('/auth/register', { username, password }),
  me: async (): Promise<MeResponse> => {
    const r = await authedFetch('/auth/me')
    if (!r.ok) throw new Error(await r.text())
    return r.json() as Promise<MeResponse>
  },
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
}
