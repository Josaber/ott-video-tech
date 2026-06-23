import { useEffect, useMemo, useState } from 'react'
import { Activity, RefreshCw } from 'lucide-react'
import { api, CmcdEvent } from '../api/client'

const KEY_LEGEND: Record<string, string> = {
  ot: 'object type',
  br: 'encoded bitrate (kbps)',
  bl: 'buffer length (ms)',
  mtp: 'measured throughput (kbps)',
  tb: 'top bitrate (kbps)',
  d: 'duration (ms)',
  sid: 'session id',
  cid: 'content id',
  sf: 'streaming format',
  st: 'stream type',
}

export function CmcdView() {
  const [events, setEvents] = useState<CmcdEvent[]>([])
  const [error, setError] = useState<string | null>(null)
  const [auto, setAuto] = useState(true)

  async function refresh() {
    try {
      const list = await api.cmcdRecent()
      setEvents(list)
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    }
  }

  useEffect(() => {
    refresh()
    if (!auto) return
    const t = setInterval(refresh, 2000)
    return () => clearInterval(t)
  }, [auto])

  const aggregates = useMemo(() => {
    if (events.length === 0) return null
    const sids = new Set<string>()
    const cids = new Set<string>()
    let mtpSum = 0
    let mtpCount = 0
    let blSum = 0
    let blCount = 0
    let brSum = 0
    let brCount = 0
    const otCounts: Record<string, number> = {}
    for (const e of events) {
      const c = e.cmcd
      if (c.sid != null) sids.add(String(c.sid))
      if (c.cid != null) cids.add(String(c.cid))
      if (typeof c.mtp === 'number') { mtpSum += c.mtp; mtpCount += 1 }
      if (typeof c.bl === 'number') { blSum += c.bl; blCount += 1 }
      if (typeof c.br === 'number') { brSum += c.br; brCount += 1 }
      const ot = String(c.ot ?? '?')
      otCounts[ot] = (otCounts[ot] ?? 0) + 1
    }
    return {
      total: events.length,
      uniqueSessions: sids.size,
      uniqueContent: cids.size,
      avgMtp: mtpCount > 0 ? mtpSum / mtpCount : null,
      avgBl: blCount > 0 ? blSum / blCount : null,
      avgBr: brCount > 0 ? brSum / brCount : null,
      otCounts,
    }
  }, [events])

  const recent = useMemo(() => events.slice(-15).reverse(), [events])

  return (
    <div className="app">
      <div>
        <div className="panel">
          <h1><Activity size={14} /> CMCD telemetry</h1>
          <p style={{ fontSize: 13, color: '#cbd5e1', marginTop: 0 }}>
            hls.js attaches CTA-5004 CMCD parameters to every segment GET it
            sends to the CDN. The mock cdn-service edge parses the query
            payload, logs each request, and forwards a JSON beacon to the
            origin's <code>/api/cmcd/ingest</code>. This panel polls the
            500-row ring buffer every 2 s.
          </p>
          {error && <div style={{ color: '#f87171', fontSize: 12 }}>{error}</div>}
          <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
            <button className="secondary" onClick={refresh}>
              <RefreshCw size={14} /> Refresh
            </button>
            <button className="secondary" onClick={() => setAuto((v) => !v)}>
              {auto ? 'Pause auto-refresh' : 'Resume auto-refresh'}
            </button>
          </div>
        </div>
        <div className="panel">
          <h1>CMCD key legend</h1>
          <div className="cmcd-legend">
            {Object.entries(KEY_LEGEND).map(([k, v]) => (
              <div key={k} className="cmcd-legend-row">
                <code>{k}</code>
                <span>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <div className="panel">
          <h1>Aggregates</h1>
          {!aggregates ? (
            <div className="empty">No CMCD beacons yet. Open an asset, hit play, and watch the dashboard fill in.</div>
          ) : (
            <div className="cmcd-aggregates">
              <Stat label="beacons" value={`${aggregates.total}`} />
              <Stat label="sessions" value={`${aggregates.uniqueSessions}`} />
              <Stat label="assets" value={`${aggregates.uniqueContent}`} />
              <Stat label="avg measured throughput" value={fmtKbps(aggregates.avgMtp)} />
              <Stat label="avg buffer length" value={fmtMs(aggregates.avgBl)} />
              <Stat label="avg encoded bitrate" value={fmtKbps(aggregates.avgBr)} />
            </div>
          )}
          {aggregates && Object.keys(aggregates.otCounts).length > 0 && (
            <>
              <h2 style={{ fontSize: 12, marginTop: 16, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                by object type
              </h2>
              <div className="cmcd-ot-row">
                {Object.entries(aggregates.otCounts).map(([k, v]) => (
                  <span key={k} className="cmcd-ot-chip">
                    <code>{k}</code> · {v}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="panel">
          <h1>Last 15 beacons</h1>
          {recent.length === 0 ? (
            <div className="empty">No beacons.</div>
          ) : (
            <div className="cmcd-table">
              {recent.map((e, i) => (
                <div key={`${e.timestamp}-${i}`} className="cmcd-row">
                  <div className="cmcd-path">{e.path}</div>
                  <div className="cmcd-kv">
                    {Object.entries(e.cmcd).map(([k, v]) => (
                      <span key={k} className="cmcd-pair">
                        <code>{k}</code>=<span>{String(v)}</span>
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="cmcd-stat">
      <span className="cmcd-stat-value">{value}</span>
      <span className="cmcd-stat-label">{label}</span>
    </div>
  )
}

function fmtKbps(v: number | null): string {
  if (v == null) return '—'
  return `${v.toFixed(0)} kbps`
}
function fmtMs(v: number | null): string {
  if (v == null) return '—'
  if (v > 1000) return `${(v / 1000).toFixed(2)} s`
  return `${v.toFixed(0)} ms`
}
