import { useState } from 'react'
import { LogIn } from 'lucide-react'
import { api } from '../api/client'

export function Login() {
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('admin')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await api.login(username, password)
    } catch (err) {
      setError(err instanceof Error && err.message === 'invalid_credentials'
        ? 'Invalid username or password.'
        : 'Login failed.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div style={{ display: 'grid', placeItems: 'center', minHeight: '100vh', padding: 24 }}>
      <form
        onSubmit={submit}
        className="panel"
        style={{ width: 360, padding: 24 }}
      >
        <h1 style={{ marginBottom: 16 }}>OTT Workflow Console</h1>
        <label>Username</label>
        <input
          autoComplete="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <label>Password</label>
        <input
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && (
          <div style={{ color: '#f87171', fontSize: 12, marginTop: 8 }}>{error}</div>
        )}
        <div style={{ marginTop: 16 }}>
          <button type="submit" disabled={busy || !username || !password}>
            <LogIn size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
            Sign in
          </button>
        </div>
        <p style={{ fontSize: 11, color: '#64748b', marginTop: 16 }}>
          Demo default: <code>admin</code> / <code>admin</code>. Override via the
          <code> users</code> table or by setting <code>JWT_SECRET</code> + a custom seed.
        </p>
      </form>
    </div>
  )
}
