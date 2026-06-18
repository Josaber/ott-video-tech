import { useState } from 'react'
import { LogIn, UserPlus } from 'lucide-react'
import { api } from '../api/client'

type Mode = 'login' | 'register'

export function Login() {
  const [mode, setMode] = useState<Mode>('login')
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('admin')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      if (mode === 'login') {
        await api.login(username, password)
      } else {
        await api.register(username, password)
      }
    } catch (err) {
      setError(translate(err))
    } finally {
      setBusy(false)
    }
  }

  const switchMode = (next: Mode) => {
    setMode(next)
    setError(null)
    if (next === 'register') {
      setUsername('')
      setPassword('')
    }
  }

  return (
    <div style={{ display: 'grid', placeItems: 'center', minHeight: '100vh', padding: 24 }}>
      <form onSubmit={submit} className="panel" style={{ width: 460, padding: 24 }}>
        <h1 style={{ marginBottom: 16 }}>OTT Workflow Console</h1>
        <div className="tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'login'}
            className={'tab' + (mode === 'login' ? ' active' : '')}
            onClick={() => switchMode('login')}
          >
            Sign in
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'register'}
            className={'tab' + (mode === 'register' ? ' active' : '')}
            onClick={() => switchMode('register')}
          >
            Register
          </button>
        </div>
        <label>Username</label>
        <input
          autoComplete={mode === 'login' ? 'username' : 'username'}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder={mode === 'register' ? 'letters, digits, . _ -' : ''}
        />
        <label>Password</label>
        <input
          type="password"
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={mode === 'register' ? 'min 8 characters' : ''}
        />
        {error && (
          <div style={{ color: '#f87171', fontSize: 12, marginTop: 8 }}>{error}</div>
        )}
        <div style={{ marginTop: 16 }}>
          <button
            type="submit"
            disabled={busy || !username || !password}
            style={{ width: '100%' }}
          >
            {mode === 'login'
              ? <><LogIn size={14} /> Sign in</>
              : <><UserPlus size={14} /> Create account</>}
          </button>
        </div>
        <p style={{ fontSize: 11, color: '#64748b', marginTop: 16 }}>
          {mode === 'login'
            ? <>Demo default: <code>admin</code> / <code>admin</code>. New accounts use the <code>VIEWER</code> role.</>
            : <>New accounts are created with the <code>VIEWER</code> role and signed in immediately.</>}
        </p>
      </form>
    </div>
  )
}

function translate(err: unknown): string {
  if (err instanceof Error) {
    if (err.message === 'invalid_credentials') return 'Invalid username or password.'
    if (err.message === 'username_taken') return 'That username is already taken.'
  }
  return 'Request failed. Try again.'
}
