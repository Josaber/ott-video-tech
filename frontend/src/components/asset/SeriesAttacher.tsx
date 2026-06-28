import { useEffect, useState } from 'react'
import { api, Asset, Season, Series } from '../../api/client'

/**
 * Admin-only "Attach to series" widget inside AssetDetail. Loads the
 * series list once, loads seasons lazily when a series is picked.
 * Episode number is unique within a season — the DB enforces this and
 * the backend translates the conflict into a 409.
 */
export function SeriesAttacher({
  asset,
  onChanged,
}: {
  asset: Asset
  onChanged: (a: Asset) => void
}) {
  const [seriesList, setSeriesList] = useState<Series[]>([])
  const [seasons, setSeasons] = useState<Season[]>([])
  // Editing buffer — only flushed on Save. seriesId is derived from the
  // currently-attached season (asset.seriesId) or from the dropdown picker.
  const [seriesId, setSeriesId] = useState<string>('')
  const [seasonId, setSeasonId] = useState<string>('')
  const [episode, setEpisode] = useState<string>('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  // Initialize the editing buffer whenever the asset's attachment changes
  // (e.g. user navigated to a different asset that has its own series).
  useEffect(() => {
    setSeriesId(asset.seriesId ?? '')
    setSeasonId(asset.seasonId ?? '')
    setEpisode(asset.episodeNumber != null ? String(asset.episodeNumber) : '')
    setErr(null)
  }, [asset.id, asset.seasonId, asset.episodeNumber, asset.seriesId])

  useEffect(() => {
    api.listSeries()
      .then(setSeriesList)
      .catch((e) => setErr(String(e)))
  }, [])

  // Load seasons when seriesId changes. Reset seasonId if it's no longer
  // in the new series.
  useEffect(() => {
    if (!seriesId) {
      setSeasons([])
      return
    }
    let cancelled = false
    api.listSeasons(seriesId)
      .then((list) => {
        if (cancelled) return
        setSeasons(list)
        if (seasonId && !list.find((s) => s.id === seasonId)) setSeasonId('')
      })
      .catch((e) => { if (!cancelled) setErr(String(e)) })
    return () => { cancelled = true }
  }, [seriesId])

  async function save() {
    setBusy(true)
    setErr(null)
    try {
      const ep = episode.trim() === '' ? null : parseInt(episode, 10)
      if (seasonId && (ep == null || !Number.isFinite(ep) || ep < 1)) {
        throw new Error('episode number is required when a season is selected')
      }
      const updated = await api.setAssetSeries(asset.id, {
        seasonId: seasonId || null,
        episodeNumber: seasonId ? ep : null,
      })
      onChanged(updated)
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e))
    } finally {
      setBusy(false)
    }
  }

  async function detach() {
    setBusy(true)
    setErr(null)
    try {
      const updated = await api.setAssetSeries(asset.id, {
        seasonId: null,
        episodeNumber: null,
      })
      onChanged(updated)
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e))
    } finally {
      setBusy(false)
    }
  }

  // "Dirty" = staged values differ from what's persisted.
  const dirty =
    (seasonId || '') !== (asset.seasonId ?? '') ||
    (seriesId || '') !== (asset.seriesId ?? '') ||
    (episode.trim() === '' ? null : parseInt(episode, 10)) !== (asset.episodeNumber ?? null)

  return (
    <div className="series-attacher">
      <span className="editorial-label">series</span>
      <select
        value={seriesId}
        onChange={(e) => { setSeriesId(e.target.value); setSeasonId('') }}
        disabled={busy}
      >
        <option value="">(none)</option>
        {seriesList.map((s) => (
          <option key={s.id} value={s.id}>{s.title}</option>
        ))}
      </select>
      <select
        value={seasonId}
        onChange={(e) => setSeasonId(e.target.value)}
        disabled={busy || !seriesId}
      >
        <option value="">{seriesId ? 'pick season' : '(no series)'}</option>
        {seasons.map((sn) => (
          <option key={sn.id} value={sn.id}>
            S{sn.seasonNumber}{sn.title ? ` · ${sn.title}` : ''}
          </option>
        ))}
      </select>
      <input
        type="number"
        min={1}
        placeholder="ep"
        value={episode}
        onChange={(e) => setEpisode(e.target.value)}
        disabled={busy || !seasonId}
        style={{ width: 60 }}
      />
      <button disabled={busy || !dirty} onClick={save}>Save</button>
      {asset.seasonId && (
        <button className="secondary" disabled={busy} onClick={detach}>Detach</button>
      )}
      {err && <span style={{ color: '#f87171', fontSize: 12 }}>{err}</span>}
    </div>
  )
}
