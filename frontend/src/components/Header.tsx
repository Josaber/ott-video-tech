import { Tv } from 'lucide-react'
import { AuthSession } from '../api/auth'
import { UserMenu } from './UserMenu'

export type View = 'console' | 'docs'

interface Props {
  session: AuthSession
  view: View
  onNavigate: (v: View) => void
  onChangePassword: () => void
}

export function Header({ session, view, onNavigate, onChangePassword }: Props) {
  return (
    <header className="app-header">
      <div className="app-header-inner">
        <div className="app-brand">
          <Tv size={18} />
          <span>OTT VIDEO</span>
        </div>
        <nav className="app-nav">
          <button
            className={'app-nav-link' + (view === 'console' ? ' active' : '')}
            onClick={() => onNavigate('console')}
          >
            Console
          </button>
          <button
            className={'app-nav-link' + (view === 'docs' ? ' active' : '')}
            onClick={() => onNavigate('docs')}
          >
            Docs
          </button>
        </nav>
        <UserMenu session={session} onChangePassword={onChangePassword} />
      </div>
    </header>
  )
}
