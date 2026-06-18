import { useEffect, useState } from 'react'
import { api } from '../api/client'

interface Props {
  open: boolean
  onClose: () => void
}

export function ChangePasswordDialog({ open, onClose }: Props) {
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null)

  useEffect(() => {
    if (!open) {
      setCurrent('')
      setNext('')
      setMsg(null)
      setBusy(false)
      return
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !busy) onClose()
    }
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [open, busy, onClose])

  if (!open) return null

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

  return (
    <div className="modal-backdrop" onClick={() => !busy && onClose()}>
      <div className="modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <h2 className="modal-title">Change password</h2>
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
          <div className="modal-actions" style={{ marginTop: 16 }}>
            <button type="button" className="secondary" disabled={busy} onClick={onClose}>
              Close
            </button>
            <button type="submit" disabled={busy || !current || !next || next.length < 8}>
              Update
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function translate(err: unknown): string {
  if (err instanceof Error) {
    if (err.message === 'invalid_credentials') return 'Current password is wrong.'
    if (err.message === 'same_as_current') return 'New password must differ from the current one.'
  }
  return 'Failed to update password.'
}
