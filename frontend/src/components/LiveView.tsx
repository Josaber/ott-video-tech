import { useEffect, useState } from 'react'
import { Radio, RefreshCw, Play, Square } from 'lucide-react'
import { api, LiveChannel } from '../api/client'
import { HlsPlayer } from './HlsPlayer'

interface Props {
  canControl: boolean
}

export function LiveView({ canControl }: Props) {
  const [channels, setChannels] = useState<LiveChannel[]>([])
  const [playing, setPlaying] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function refresh() {
    try {
      const list = await api.liveChannels()
      setChannels(list)
      setError(null)
    } catch (e) {
      setError(String(e))
    }
  }

  useEffect(() => {
    refresh()
    const t = setInterval(refresh, 4000)
    return () => clearInterval(t)
  }, [])

  async function start() {
    setBusy(true)
    setError(null)
    try {
      await api.liveStart()
      await refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setBusy(false)
    }
  }

  async function stop() {
    setBusy(true)
    setError(null)
    try {
      await api.liveStop()
      await refresh()
      // If we were playing the stopped channel, drop the player.
      setPlaying(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setBusy(false)
    }
  }

  const channel = channels[0]

  return (
    <div className="app">
      <div>
        <div className="panel">
          <h1>Live channels</h1>
          {error && <div style={{ color: '#f87171', fontSize: 12 }}>{error}</div>}
          {!channel && <div className="empty">No live channels configured.</div>}
          {channel && (
            <div
              className={'live-card' + (playing === channel.slug ? ' active' : '')}
              onClick={() => channel.running && setPlaying(channel.slug)}
            >
              <div className="live-card-head">
                <Radio size={16} />
                <span className="live-card-name">{channel.name}</span>
                <span className={'live-status ' + (channel.running ? 'on' : 'off')}>
                  {channel.running ? 'LIVE' : 'OFF'}
                </span>
              </div>
              <div className="live-card-desc">{channel.description}</div>
              {channel.source && (
                <div className="live-card-source">source: {channel.source}</div>
              )}
            </div>
          )}
          <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
            <button className="secondary" onClick={refresh}>
              <RefreshCw size={14} /> Refresh
            </button>
            {canControl && channel && !channel.running && (
              <button disabled={busy} onClick={start}>
                <Play size={14} /> Start
              </button>
            )}
            {canControl && channel && channel.running && (
              <button className="danger" disabled={busy} onClick={stop}>
                <Square size={14} /> Stop
              </button>
            )}
          </div>
        </div>
      </div>
      <div>
        {playing && channel && channel.running ? (
          <div className="panel">
            <h1>{channel.name}</h1>
            <div className="meta-row" style={{ marginBottom: 12 }}>
              <span>LIVE</span>
              <span>{channel.manifestUrl}</span>
            </div>
            <HlsPlayer src={channel.manifestUrl} />
          </div>
        ) : (
          <div className="panel">
            <h1>Live playback</h1>
            <p style={{ fontSize: 14, color: '#cbd5e1', marginTop: 0 }}>
              The backend pipes a published VOD asset back through ffmpeg with
              <code> -re -stream_loop -1</code> and emits a 6-segment rolling-window HLS
              feed. Click the live card on the left to play.
            </p>
            <p style={{ fontSize: 13, color: '#94a3b8' }}>
              hls.js auto-detects the live edge (no <code>#EXT-X-ENDLIST</code>) and snaps
              the playhead there on attach. End-to-end latency lands around 6 s with the
              current 2 s segment duration — not strictly LL-HLS, but close enough that
              the demo loop feels like a real channel.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
