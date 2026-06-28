import { Tv } from 'lucide-react'
import { AuthSession } from '../api/auth'
import { UserMenu } from './UserMenu'

export type View = 'catalog' | 'asset' | 'live' | 'cmcd' | 'docs'

interface Props {
  session: AuthSession
  view: View
  isAdmin: boolean
  onNavigate: (v: View) => void
  onChangePassword: () => void
}

export function Header({ session, view, isAdmin, onNavigate, onChangePassword }: Props) {
  return (
    <header className="app-header">
      <div className="app-header-inner">
        <div className="app-brand">
          <Tv size={18} />
          <span>OTT VIDEO</span>
        </div>
        <nav className="app-nav">
          {isAdmin && (
            <button
              className={'app-nav-link' + (view === 'catalog' ? ' active' : '')}
              onClick={() => onNavigate('catalog')}
            >
              Catalog
            </button>
          )}
          <button
            className={'app-nav-link' + (view === 'asset' ? ' active' : '')}
            onClick={() => onNavigate('asset')}
          >
            Asset
          </button>
          <button
            className={'app-nav-link' + (view === 'live' ? ' active' : '')}
            onClick={() => onNavigate('live')}
          >
            Live
          </button>
          <button
            className={'app-nav-link' + (view === 'cmcd' ? ' active' : '')}
            onClick={() => onNavigate('cmcd')}
          >
            CMCD
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
