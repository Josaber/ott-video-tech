import { useEffect, useMemo, useState } from 'react'
import { ChevronDown, ChevronRight, Film, Layers, Plus, Trash2 } from 'lucide-react'
import { api, Season, Series } from '../api/client'
import { ConfirmDialog } from './ConfirmDialog'
import { NewSeasonRow } from './catalog/NewSeasonRow'

/**
 * Admin-only catalog manager: create series, create seasons inside a
 * series, delete either. Seasons are eagerly pre-fetched on mount so each
 * series card can show its season count without forcing the admin to
 * expand it first — fine for the tech-demo scale (<100 series). At larger
 * scale this would need a single /api/series?withCounts endpoint instead
 * of one listSeasons call per series.
 */
export function CatalogPanel() {
  const [series, setSeries] = useState<Series[]>([])
  const [seasonsBySeries, setSeasonsBySeries] = useState<Record<string, Season[]>>({})
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [newTitle, setNewTitle] = useState('')
  const [busy, setBusy] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<
    | { kind: 'series'; id: string; label: string }
    | { kind: 'season'; id: string; label: string }
    | null
  >(null)

  async function refresh() {
    try {
      setError(null)
      const list = await api.listSeries()
      setSeries(list)
      // Parallel pre-load so we can show "N seasons" badges immediately.
      const seasonsLists = await Promise.all(
        list.map((s) => api.listSeasons(s.id).catch(() => [] as Season[])),
      )
      const cache: Record<string, Season[]> = {}
      list.forEach((s, i) => { cache[s.id] = seasonsLists[i] })
      setSeasonsBySeries(cache)
    } catch (e) {
      setError(String(e))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { refresh() }, [])

  function toggle(seriesId: string) {
    setExpanded((s) => {
      const next = new Set(s)
      if (next.has(seriesId)) next.delete(seriesId)
      else next.add(seriesId)
      return next
    })
  }

  async function createSeries() {
    const title = newTitle.trim()
    if (!title) return
    setBusy(true)
    try {
      const created = await api.createSeries({ title })
      setNewTitle('')
      // Optimistic-ish: insert in sorted order without waiting for refresh,
      // then refresh in the background so the count badge stays accurate.
      setSeries((s) => [...s, created].sort((a, b) => a.title.localeCompare(b.title)))
      setSeasonsBySeries((s) => ({ ...s, [created.id]: [] }))
      // Auto-expand the new series so the admin can immediately add a season.
      setExpanded((s) => new Set(s).add(created.id))
    } catch (e) {
      setError(String(e))
    } finally {
      setBusy(false)
    }
  }

  async function createSeason(seriesId: string, seasonNumber: number, title: string) {
    setBusy(true)
    try {
      const created = await api.createSeason(seriesId, {
        seasonNumber,
        title: title.trim() || undefined,
      })
      setSeasonsBySeries((s) => ({
        ...s,
        [seriesId]: [...(s[seriesId] ?? []), created].sort((a, b) => a.seasonNumber - b.seasonNumber),
      }))
    } catch (e) {
      setError(String(e))
    } finally {
      setBusy(false)
    }
  }

  async function performDelete() {
    if (!deleteTarget) return
    setBusy(true)
    try {
      if (deleteTarget.kind === 'series') {
        await api.deleteSeries(deleteTarget.id)
        const id = deleteTarget.id
        setSeasonsBySeries((s) => {
          const next = { ...s }
          delete next[id]
          return next
        })
        setSeries((arr) => arr.filter((s) => s.id !== id))
        setExpanded((s) => {
          const next = new Set(s)
          next.delete(id)
          return next
        })
      } else {
        await api.deleteSeason(deleteTarget.id)
        setSeasonsBySeries((s) => {
          const next: Record<string, Season[]> = {}
          for (const [k, v] of Object.entries(s)) {
            next[k] = v.filter((x) => x.id !== deleteTarget.id)
          }
          return next
        })
      }
      setDeleteTarget(null)
    } catch (e) {
      setError(String(e))
    } finally {
      setBusy(false)
    }
  }

  const totalSeasons = useMemo(
    () => Object.values(seasonsBySeries).reduce((acc, list) => acc + list.length, 0),
    [seasonsBySeries],
  )

  return (
    <div className="catalog">
      {error && <div className="catalog-error">{error}</div>}

      <div className="catalog-stats">
        <span className="catalog-stat">
          <Film size={12} />
          <span className="catalog-stat-num">{series.length}</span> series
        </span>
        <span className="catalog-stat-sep">·</span>
        <span className="catalog-stat">
          <Layers size={12} />
          <span className="catalog-stat-num">{totalSeasons}</span> season{totalSeasons === 1 ? '' : 's'}
        </span>
      </div>

      <div className="catalog-add-card">
        <input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="New series title — e.g. “Stranger Things”"
          onKeyDown={(e) => { if (e.key === 'Enter') createSeries() }}
        />
        <button disabled={busy || !newTitle.trim()} onClick={createSeries}>
          <Plus size={14} />
          Add series
        </button>
      </div>

      {loading ? (
        <div className="catalog-empty">Loading…</div>
      ) : series.length === 0 ? (
        <div className="catalog-empty">
          <Film size={28} strokeWidth={1.5} />
          <div className="catalog-empty-title">No series yet</div>
          <div className="catalog-empty-hint">Create one above to start grouping episodes.</div>
        </div>
      ) : (
        <div className="catalog-list">
          {series.map((s) => {
            const seasons = seasonsBySeries[s.id] ?? []
            const isOpen = expanded.has(s.id)
            return (
              <div key={s.id} className={`catalog-card${isOpen ? ' is-open' : ''}`}>
                <div className="catalog-card-head">
                  <button
                    type="button"
                    className="catalog-head-main"
                    onClick={() => toggle(s.id)}
                    aria-expanded={isOpen}
                  >
                    <span className="catalog-chevron">
                      {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </span>
                    <span className="catalog-card-title">{s.title}</span>
                    <span className="catalog-count">
                      {seasons.length} season{seasons.length === 1 ? '' : 's'}
                    </span>
                  </button>
                  <button
                    type="button"
                    className="danger catalog-icon-btn"
                    disabled={busy}
                    onClick={() => setDeleteTarget({ kind: 'series', id: s.id, label: s.title })}
                    title="Delete series (and its seasons)"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
                {isOpen && (
                  <div className="catalog-card-body">
                    {seasons.length === 0 ? (
                      <div className="catalog-sub-empty">No seasons yet. Add one below.</div>
                    ) : (
                      <div className="catalog-season-grid">
                        {seasons.map((sn) => (
                          <div key={sn.id} className="catalog-season-chip">
                            <span className="catalog-season-num">S{sn.seasonNumber}</span>
                            {sn.title && <span className="catalog-season-title">{sn.title}</span>}
                            <button
                              type="button"
                              className="danger catalog-icon-btn"
                              disabled={busy}
                              onClick={() => setDeleteTarget({
                                kind: 'season',
                                id: sn.id,
                                label: `S${sn.seasonNumber}${sn.title ? ` · ${sn.title}` : ''} of ${s.title}`,
                              })}
                              title="Delete season (its episodes become standalone)"
                            >
                              <Trash2 size={11} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    <NewSeasonRow
                      existing={seasons.map((sn) => sn.seasonNumber)}
                      busy={busy}
                      onCreate={(num, title) => createSeason(s.id, num, title)}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title={deleteTarget ? `Delete ${deleteTarget.kind === 'series' ? 'series' : 'season'} "${deleteTarget.label}"?` : ''}
        body={
          deleteTarget?.kind === 'series'
            ? 'All seasons of this series will also be deleted. Episodes (assets) attached to those seasons become standalone — they keep playing but lose their up-next chain.'
            : 'Episodes attached to this season become standalone — they keep playing but lose their up-next chain.'
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        danger
        busy={busy}
        onConfirm={performDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}

