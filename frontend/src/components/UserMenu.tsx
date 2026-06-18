import { useEffect, useRef, useState } from 'react'
import { ChevronDown, KeyRound, LogOut, UserCircle2 } from 'lucide-react'
import { AuthSession, clearSession } from '../api/auth'

interface Props {
  session: AuthSession
  onChangePassword: () => void
}

export function UserMenu({ session, onChangePassword }: Props) {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div className="user-menu" ref={wrapRef}>
      <button
        type="button"
        className="user-menu-trigger"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <UserCircle2 size={18} />
        <span className="user-menu-name">{session.username}</span>
        <span className="user-menu-role">{session.role}</span>
        <ChevronDown size={14} className={'user-menu-chevron' + (open ? ' open' : '')} />
      </button>
      {open && (
        <div className="user-menu-dropdown" role="menu">
          <button
            role="menuitem"
            onClick={() => {
              setOpen(false)
              onChangePassword()
            }}
          >
            <KeyRound size={14} />
            Change password
          </button>
          <button
            role="menuitem"
            onClick={() => {
              setOpen(false)
              clearSession()
            }}
          >
            <LogOut size={14} />
            Sign out
          </button>
        </div>
      )}
    </div>
  )
}
