import { useState } from 'react'
import { KeyRound } from 'lucide-react'
import { api } from '../api/client'

export function ChangePassword() {
  const [open, setOpen] = useState(false)
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setMsg(null)
    try {
      await api.changePassword(current, next)
      setCurrent('')
      setNext('')
      setMsg({ kind: 'ok', text: 'Password updated.' })
    } catch (err) {
      setMsg({ kind: 'err', text: translate(err) })
    } finally {
      setBusy(false)
    }
  }

  if (!open) {
    return (
      <button className="secondary" onClick={() => setOpen(true)} style={{ width: '100%' }}>
        <KeyRound size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
        Change password
      </button>
    )
  }

  return (
    <form onSubmit={submit}>
      <label>Current password</label>
      <input
        type="password"
        autoComplete="current-password"
        value={current}
        onChange={(e) => setCurrent(e.target.value)}
      />
      <label>New password</label>
      <input
        type="password"
        autoComplete="new-password"
        value={next}
        onChange={(e) => setNext(e.target.value)}
        placeholder="min 8 characters"
      />
      {msg && (
        <div
          style={{
            fontSize: 12,
            marginTop: 8,
            color: msg.kind === 'ok' ? '#4ade80' : '#f87171',
          }}
        >
          {msg.text}
        </div>
      )}
      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <button type="submit" disabled={busy || !current || !next || next.length < 8}>
          Update
        </button>
        <button
          type="button"
          className="secondary"
          onClick={() => {
            setOpen(false)
            setCurrent('')
            setNext('')
            setMsg(null)
          }}
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

function translate(err: unknown): string {
  if (err instanceof Error) {
    if (err.message === 'invalid_credentials') return 'Current password is wrong.'
    if (err.message === 'same_as_current') return 'New password must differ from the current one.'
  }
  return 'Failed to update password.'
}
