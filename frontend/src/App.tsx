import { useEffect, useState, useCallback } from 'react'
import { api, Asset } from './api/client'
import { AssetList } from './components/AssetList'
import { CreateAssetForm } from './components/CreateAssetForm'
import { AssetDetail } from './components/AssetDetail'
import { CatalogPanel } from './components/CatalogPanel'
import { Login } from './components/Login'
import { Header, View } from './components/Header'
import { ChangePasswordDialog } from './components/ChangePasswordDialog'
import { ArchitectureDiagram } from './components/ArchitectureDiagram'
import { Docs } from './components/Docs'
import { LiveView } from './components/LiveView'
import { CmcdView } from './components/CmcdView'
import { ContinueWatching } from './components/ContinueWatching'
import { AuthSession, getSession, onSessionChange, updateProfile } from './api/auth'

function readView(): View {
  const h = window.location.hash
  if (h.startsWith('#/docs')) return 'docs'
  if (h.startsWith('#/live')) return 'live'
  if (h.startsWith('#/cmcd')) return 'cmcd'
  if (h.startsWith('#/catalog')) return 'catalog'
  return 'asset'
}

function readQueryParams(): { assetId?: string; tSec?: number } {
  const h = window.location.hash
  const qIdx = h.indexOf('?')
  if (qIdx < 0) return {}
  const params = new URLSearchParams(h.substring(qIdx + 1))
  const assetId = params.get('asset') ?? undefined
  const t = params.get('t')
  return {
    assetId,
    tSec: t ? parseFloat(t) : undefined,
  }
}

export default function App() {
  const [session, setSessionState] = useState<AuthSession | null>(getSession())
  const [assets, setAssets] = useState<Asset[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [changePassOpen, setChangePassOpen] = useState(false)
  const [view, setView] = useState<View>(readView)
  const [shareInitialSeek, setShareInitialSeek] = useState<number | undefined>(undefined)
  const [upNextAsset, setUpNextAsset] = useState<Asset | null>(null)

  useEffect(() => {
    const onHash = () => {
      setView(readView())
      const { assetId, tSec } = readQueryParams()
      if (assetId) {
        setSelected(assetId)
        setShareInitialSeek(tSec)
      }
    }
    onHash()  // run once on mount to honour the share-at-timestamp URL
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const navigate = useCallback((next: View) => {
    setView(next)
    const target =
      next === 'docs' ? '#/docs/overview'
      : next === 'live' ? '#/live'
      : next === 'cmcd' ? '#/cmcd'
      : next === 'catalog' ? '#/catalog'
      : '#/asset'
    if (window.location.hash !== target) {
      window.history.pushState(null, '', target)
    }
  }, [])

  useEffect(() => {
    return onSessionChange(() => setSessionState(getSession()))
  }, [])

  // Re-check the JWT exp every 30s. If the token quietly expires while the user
  // is idle on the page, this flips them back to the login screen without
  // waiting for the next API call to 401.
  useEffect(() => {
    const t = setInterval(() => {
      const current = getSession()
      if (current === null && session !== null) setSessionState(null)
    }, 30000)
    return () => clearInterval(t)
  }, [session])

  // Re-fetch /auth/me on window focus so a role change made by an admin
  // (e.g. demoting this user from ADMIN to VIEWER) reaches the UI before
  // the access token's 15-minute refresh would propagate it. We do NOT
  // fetch on mount: login and /auth/refresh both return the fresh role
  // in their response body, so the session in localStorage is already
  // up to date the first time this effect runs.
  useEffect(() => {
    if (!session) return
    let cancelled = false
    const onFocus = async () => {
      try {
        const me = await api.me()
        if (cancelled) return
        const current = getSession()
        if (current && (current.username !== me.username || current.role !== me.role)) {
          updateProfile(me.username, me.role)
        }
      } catch {
        /* a 401 here is handled by jsonOrThrow → clearSession */
      }
    }
    window.addEventListener('focus', onFocus)
    return () => {
      cancelled = true
      window.removeEventListener('focus', onFocus)
    }
  }, [session?.token])

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

  // Up-next lookup runs on the backend (same-season episode+1, else next
  // season's first episode). Re-fetch whenever the selected asset changes —
  // includes the case where the user clicks the up-next card and we
  // advance to a new asset.
  useEffect(() => {
    if (!session || !selected) {
      setUpNextAsset(null)
      return
    }
    let cancelled = false
    api.getNextAsset(selected)
      .then((next) => { if (!cancelled) setUpNextAsset(next) })
      .catch(() => { if (!cancelled) setUpNextAsset(null) })
    return () => { cancelled = true }
  }, [selected, session])

  if (!session) return <Login />

  const isAdmin = session.role === 'ADMIN'

  return (
    <>
      <Header
        session={session}
        view={view}
        isAdmin={isAdmin}
        onNavigate={navigate}
        onChangePassword={() => setChangePassOpen(true)}
      />
      {view === 'docs' ? (
        <Docs />
      ) : view === 'live' ? (
        <LiveView canControl={isAdmin} />
      ) : view === 'cmcd' ? (
        <CmcdView />
      ) : view === 'catalog' && isAdmin ? (
        <div className="app catalog-app">
          <div className="panel">
            <h1>Catalog</h1>
            <p style={{ fontSize: 13, color: '#cbd5e1', marginTop: 0 }}>
              Create series and seasons here, then on the <strong>Asset</strong> tab attach
              each video to a (series, season, episode). Up Next on the player follows that
              chain: same season → episode + 1, else next season's first episode.
            </p>
            <CatalogPanel />
          </div>
        </div>
      ) : (
        <div className="app">
          <div>
            {isAdmin && (
              <div className="panel">
                <h1>New asset</h1>
                <CreateAssetForm onCreated={refresh} />
              </div>
            )}
            <div className="panel">
              <h1>Assets</h1>
              {error && (
                <div style={{ color: '#f87171', fontSize: 12, marginBottom: 8 }}>{error}</div>
              )}
              <AssetList assets={assets} selected={selected} onSelect={setSelected} />
            </div>
          </div>
          <div>
            {selected ? (() => {
              const upNext = upNextAsset
                ? {
                    title: upNextAsset.title,
                    posterUrl: upNextAsset.posterUrl,
                    subtitle: upNextAsset.seriesTitle && upNextAsset.seasonNumber != null && upNextAsset.episodeNumber != null
                      ? `${upNextAsset.seriesTitle} · S${upNextAsset.seasonNumber} E${upNextAsset.episodeNumber}`
                      : null,
                    onPlay: () => setSelected(upNextAsset.id),
                  }
                : null
              return (
                <AssetDetail
                  assetId={selected}
                  onChange={refresh}
                  canWrite={isAdmin}
                  initialSeekSeconds={shareInitialSeek}
                  upNext={upNext}
                />
              )
            })() : (
              <>
                <ContinueWatching onSelect={setSelected} />
                <div className="panel">
                  <h1>Workflow console</h1>
                <p style={{ fontSize: 14, color: '#cbd5e1', marginTop: 0 }}>
                  Create an asset, upload a raw video, and click <strong>Process &amp; publish</strong>.
                  The backend runs FFmpeg, calls the ad-service over VAST, stitches the ad m3u8 into the
                  encrypted program manifest, and exposes the result for playback. The player blocks
                  seeking and fast-forwarding during the ad. Open the <strong>Docs</strong> tab for the
                  full background.
                </p>
                <div style={{ marginTop: 16 }}>
                  <ArchitectureDiagram />
                </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      <ChangePasswordDialog open={changePassOpen} onClose={() => setChangePassOpen(false)} />
    </>
  )
}
