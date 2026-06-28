/**
 * Top-of-player Quality / Audio / Subtitles picker. Renders nothing
 * unless the manifest exposed > 1 of any of them.
 */
interface Track { id: number; name: string; lang?: string }
interface Level { id: number; label: string }

export function TrackPicker({
  levels,
  pinnedLevel,
  onLevelChange,
  audioTracks,
  activeAudio,
  onAudioChange,
  subtitleTracks,
  activeSubtitle,
  onSubtitleChange,
}: {
  levels: Level[]
  pinnedLevel: number
  onLevelChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  audioTracks: Track[]
  activeAudio: number
  onAudioChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  subtitleTracks: Track[]
  activeSubtitle: number
  onSubtitleChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
}) {
  if (audioTracks.length <= 1 && subtitleTracks.length === 0 && levels.length <= 1) {
    return null
  }
  return (
    <div className="track-picker">
      {levels.length > 1 && (
        <label>
          Quality
          <select value={pinnedLevel} onChange={onLevelChange}>
            <option value={-1}>Auto</option>
            {levels.map((l) => (
              <option key={l.id} value={l.id}>{l.label}</option>
            ))}
          </select>
        </label>
      )}
      {audioTracks.length > 1 && (
        <label>
          Audio
          <select value={activeAudio} onChange={onAudioChange}>
            {audioTracks.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}{t.lang ? ` (${t.lang})` : ''}
              </option>
            ))}
          </select>
        </label>
      )}
      {subtitleTracks.length > 0 && (
        <label>
          Subtitles
          <select value={activeSubtitle} onChange={onSubtitleChange}>
            <option value={-1}>Off</option>
            {subtitleTracks.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}{t.lang ? ` (${t.lang})` : ''}
              </option>
            ))}
          </select>
        </label>
      )}
    </div>
  )
}
