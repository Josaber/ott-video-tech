import { useEffect, useState, useCallback } from 'react'
import { LogOut } from 'lucide-react'
import { api, Asset } from './api/client'
import { AssetList } from './components/AssetList'
import { CreateAssetForm } from './components/CreateAssetForm'
import { AssetDetail } from './components/AssetDetail'
import { Login } from './components/Login'
import { AuthSession, clearSession, getSession, onSessionChange } from './api/auth'

export default function App() {
  const [session, setSessionState] = useState<AuthSession | null>(getSession())
  const [assets, setAssets] = useState<Asset[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    return onSessionChange(() => setSessionState(getSession()))
  }, [])

  const refresh = useCallback(async () => {
    if (!session) return
    try {
      const list = await api.list()
      setAssets(list)
      setError(null)
      if (selected && !list.find((a) => a.id === selected)) {
        setSelected(null)
      }
    } catch (e) {
      if (e instanceof Error && e.message === 'unauthenticated') {
        // session was cleared by jsonOrThrow; let session-change effect re-render to login
        return
      }
      setError(String(e))
    }
  }, [selected, session])

  useEffect(() => {
    if (!session) return
    refresh()
    const t = setInterval(refresh, 4000)
    return () => clearInterval(t)
  }, [refresh, session])

  if (!session) return <Login />

  return (
    <div className="app">
      <div>
        <div className="panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 11, color: '#94a3b8' }}>SIGNED IN AS</div>
            <div style={{ fontWeight: 600 }}>{session.username}</div>
            <div style={{ fontSize: 11, color: '#64748b' }}>{session.role}</div>
          </div>
          <button className="secondary" onClick={() => clearSession()}>
            <LogOut size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
            Sign out
          </button>
        </div>
        <div className="panel">
          <h1>New asset</h1>
          <CreateAssetForm onCreated={refresh} />
        </div>
        <div className="panel">
          <h1>Assets</h1>
          {error && (
            <div style={{ color: '#f87171', fontSize: 12, marginBottom: 8 }}>{error}</div>
          )}
          <AssetList assets={assets} selected={selected} onSelect={setSelected} />
        </div>
      </div>
      <div>
        {selected ? (
          <AssetDetail assetId={selected} onChange={refresh} />
        ) : (
          <div className="panel">
            <h1>Workflow console</h1>
            <p style={{ fontSize: 14, color: '#cbd5e1' }}>
              Create an asset, upload a raw video, and click <strong>Process &amp; publish</strong>.
              The backend runs FFmpeg, calls the ad-service over VAST, stitches the ad m3u8 into the
              encrypted program manifest, and exposes the result for playback. The player blocks
              seeking and fast-forwarding during the ad.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
