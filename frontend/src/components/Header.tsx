import { Tv } from 'lucide-react'
import { AuthSession } from '../api/auth'
import { UserMenu } from './UserMenu'

interface Props {
  session: AuthSession
  onChangePassword: () => void
}

export function Header({ session, onChangePassword }: Props) {
  return (
    <header className="app-header">
      <div className="app-header-inner">
        <div className="app-brand">
          <Tv size={18} />
          <span>OTT VIDEO</span>
        </div>
        <UserMenu session={session} onChangePassword={onChangePassword} />
      </div>
    </header>
  )
}
