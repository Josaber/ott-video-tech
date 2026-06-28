import { useEffect, useMemo, useRef, useState } from 'react'
import { Upload, Play, RefreshCw, Trash2 } from 'lucide-react'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import { api, Asset, EditorialState, Job, Rendition } from '../api/client'
import { HlsPlayer } from './HlsPlayer'
import { ConfirmDialog } from './ConfirmDialog'
import { SeriesAttacher } from './asset/SeriesAttacher'
import { AbrLadder } from './asset/AbrLadder'
import { EditorialBar } from './asset/EditorialBar'

interface Props {
  assetId: string
  onChange: () => void
  canWrite: boolean
  initialSeekSeconds?: number
  upNext?: {
    title: string
    subtitle?: string | null
    posterUrl?: string | null
    onPlay: () => void
  } | null
}

export function AssetDetail({ assetId, onChange, canWrite, initialSeekSeconds, upNext }: Props) {
  const [asset, setAsset] = useState<Asset | null>(null)
  const [jobs, setJobs] = useState<Job[]>([])
  const [renditions, setRenditions] = useState<Rendition[]>([])
  const [busy, setBusy] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  // Render description as markdown (bold/italic/links/lists/code) with
  // DOMPurify sanitisation so a malicious description can't slip <script>
  // into the page. Cached per description string.
  const descriptionHtml = useMemo(() => {
    if (!asset?.description) return ''
    const raw = marked.parse(asset.description, { async: false, breaks: true }) as string
    return DOMPurify.sanitize(raw)
  }, [asset?.description])

  async function refresh() {
    const [a, j, r] = await Promise.all([
      api.get(assetId),
      api.jobs(assetId),
      api.renditions(assetId).catch(() => [] as Rendition[]),
    ])
    setAsset(a)
    setJobs(j)
    setRenditions(r)
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

  async function transition(target: EditorialState) {
    setBusy(true)
    try {
      const updated = await api.transitionEditorial(assetId, target)
      setAsset(updated)
      onChange()
    } finally {
      setBusy(false)
    }
  }

  async function changeCategory(value: string) {
    setBusy(true)
    try {
      const updated = await api.setCategory(assetId, value || null)
      setAsset(updated)
      onChange()
    } finally {
      setBusy(false)
    }
  }

  async function confirmRemove() {
    setBusy(true)
    try {
      await api.delete(assetId)
      // The list refresh in App will notice the asset is gone and clear the
      // selection, so AssetDetail unmounts on its own — no need to setAsset(null).
      onChange()
      setConfirmDelete(false)
    } finally {
      setBusy(false)
    }
  }

  if (!asset) return <div className="empty">Loading…</div>

  return (
    <>
      <div className="panel">
        <h1>{asset.title}</h1>
        {asset.seriesTitle && asset.seasonNumber != null && asset.episodeNumber != null && (
          <div className="series-badge">
            <span className="series-badge-show">{asset.seriesTitle}</span>
            <span className="series-badge-sep">·</span>
            <span className="series-badge-ep">S{asset.seasonNumber} E{asset.episodeNumber}</span>
          </div>
        )}
        <div className="meta-row" style={{ marginBottom: 12 }}>
          <span>status: {asset.status}</span>
          <span className={'editorial-pill editorial-' + asset.editorialState.toLowerCase()}>
            {asset.editorialState.replace('_', ' ')}
          </span>
          {asset.category && <span title={asset.category}>category: {asset.category}</span>}
          {asset.adId && <span title={asset.adId}>ad: {asset.adId} ({(asset.adDurationMs ?? 0) / 1000}s)</span>}
          {asset.drmKeyIdPreview && <span>drm key: {asset.drmKeyIdPreview}</span>}
        </div>
        {asset.description && (
          <div
            className="asset-description"
            dangerouslySetInnerHTML={{ __html: descriptionHtml }}
          />
        )}

        {canWrite && (
          <EditorialBar
            asset={asset}
            busy={busy}
            onTransition={transition}
            onChangeCategory={changeCategory}
          />
        )}

        {canWrite && (
          <SeriesAttacher
            asset={asset}
            onChanged={(updated) => { setAsset(updated); onChange() }}
          />
        )}

        <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
          {canWrite && (
            <>
              <button
                className="secondary"
                disabled={busy}
                onClick={() => fileRef.current?.click()}
              >
                <Upload size={14} />
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
                disabled={busy || !asset.rawUploaded || asset.status === 'PROCESSING' || asset.editorialState !== 'READY'}
                onClick={process}
                title={asset.editorialState !== 'READY' ? 'Asset must be in READY editorial state' : undefined}
              >
                <Play size={14} />
                Process &amp; publish
              </button>
            </>
          )}
          <button className="secondary" onClick={refresh}>
            <RefreshCw size={14} />
            Refresh
          </button>
          {canWrite && (
            <button className="danger" disabled={busy} onClick={() => setConfirmDelete(true)}>
              <Trash2 size={14} />
              Delete
            </button>
          )}
        </div>
      </div>

      <AbrLadder renditions={renditions} />

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
          <HlsPlayer
            src={asset.playbackUrl}
            assetId={asset.id}
            thumbnailsUrl={asset.thumbnailsUrl}
            initialSeekSeconds={initialSeekSeconds}
            upNext={upNext}
          />
          <div className="meta-row" style={{ marginTop: 8 }}>
            <span>{asset.playbackUrl}</span>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmDelete}
        title={`Delete "${asset.title}"?`}
        body="This terminates any running workflow and removes the uploaded raw video and the packaged HLS output. This cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        danger
        busy={busy}
        onConfirm={confirmRemove}
        onCancel={() => setConfirmDelete(false)}
      />
    </>
  )
}

