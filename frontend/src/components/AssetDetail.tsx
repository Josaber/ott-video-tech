import { useEffect, useRef, useState } from 'react'
import { Upload, Play, RefreshCw } from 'lucide-react'
import { api, Asset, Job } from '../api/client'
import { HlsPlayer } from './HlsPlayer'

interface Props {
  assetId: string
  onChange: () => void
  canWrite: boolean
}

export function AssetDetail({ assetId, onChange, canWrite }: Props) {
  const [asset, setAsset] = useState<Asset | null>(null)
  const [jobs, setJobs] = useState<Job[]>([])
  const [busy, setBusy] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  async function refresh() {
    const [a, j] = await Promise.all([api.get(assetId), api.jobs(assetId)])
    setAsset(a)
    setJobs(j)
  }

  useEffect(() => {
    refresh()
  }, [assetId])

  useEffect(() => {
    if (!asset) return
    if (asset.status !== 'PROCESSING') return
    const t = setInterval(refresh, 1500)
    return () => clearInterval(t)
  }, [asset?.status])

  async function upload(f: File) {
    setBusy(true)
    try {
      await api.upload(assetId, f)
      await refresh()
      onChange()
    } finally {
      setBusy(false)
    }
  }

  async function process() {
    setBusy(true)
    try {
      await api.process(assetId)
      await refresh()
      onChange()
    } finally {
      setBusy(false)
    }
  }

  if (!asset) return <div className="empty">Loading…</div>

  return (
    <>
      <div className="panel">
        <h1>{asset.title}</h1>
        <div className="meta-row" style={{ marginBottom: 12 }}>
          <span>status: {asset.status}</span>
          {asset.adId && <span>ad: {asset.adId} ({(asset.adDurationMs ?? 0) / 1000}s)</span>}
          {asset.drmKeyIdPreview && <span>drm key: {asset.drmKeyIdPreview}</span>}
        </div>
        {asset.description && (
          <p style={{ fontSize: 14, color: '#cbd5e1' }}>{asset.description}</p>
        )}

        <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
          {canWrite && (
            <>
              <button
                className="secondary"
                disabled={busy}
                onClick={() => fileRef.current?.click()}
              >
                <Upload size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                {asset.rawUploaded ? 'Re-upload raw' : 'Upload raw'}
              </button>
              <input
                type="file"
                accept="video/*"
                hidden
                ref={fileRef}
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f) upload(f)
                  e.target.value = ''
                }}
              />
              <button
                disabled={busy || !asset.rawUploaded || asset.status === 'PROCESSING'}
                onClick={process}
              >
                <Play size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                Process &amp; publish
              </button>
            </>
          )}
          <button className="secondary" onClick={refresh}>
            <RefreshCw size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
            Refresh
          </button>
        </div>
      </div>

      <div className="panel">
        <h1>Workflow</h1>
        <div className="jobs">
          {jobs.length === 0 && <div className="empty">No jobs yet.</div>}
          {jobs.map((j) => (
            <div className="job" key={j.id}>
              <span className="stage">{j.stage}</span>
              <span className={'status-pill ' + j.status}>{j.status}</span>
              <span className="msg">{j.message ?? ''}</span>
            </div>
          ))}
        </div>
      </div>

      {asset.playbackUrl && asset.status === 'PUBLISHED' && (
        <div className="panel">
          <h1>Playback</h1>
          <HlsPlayer src={asset.playbackUrl} />
          <div className="meta-row" style={{ marginTop: 8 }}>
            <span>{asset.playbackUrl}</span>
          </div>
        </div>
      )}
    </>
  )
}
