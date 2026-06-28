/**
 * Top-right pill showing the variant currently playing. Adds an "AUTO"
 * chip when the user is in ABR-Auto mode so the dropdown's "Auto"
 * selection and the actual playing tier aren't confused for each other.
 */
export function BitrateOverlay({
  levels,
  pinnedLevel,
  playingLevel,
}: {
  levels: { id: number; label: string }[]
  pinnedLevel: number
  playingLevel: number
}) {
  if (levels.length <= 1 || playingLevel < 0 || !levels[playingLevel]) return null
  return (
    <div className="bitrate-overlay">
      {pinnedLevel === -1 && <span className="bitrate-mode">AUTO</span>}
      {levels[playingLevel].label}
    </div>
  )
}
