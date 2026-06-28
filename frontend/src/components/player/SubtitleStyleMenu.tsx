export interface SubStyle {
  fontSize: number
  color: string
  bgOpacity: number
}

export const DEFAULT_SUB_STYLE: SubStyle = { fontSize: 18, color: '#ffffff', bgOpacity: 0.7 }

/**
 * Drop-down panel over the video for tweaking ::cue styles. Values are
 * pushed into a global <style> tag by the useSubtitleStyle hook.
 */
export function SubtitleStyleMenu({
  open,
  style,
  onChange,
}: {
  open: boolean
  style: SubStyle
  onChange: (next: SubStyle) => void
}) {
  if (!open) return null
  return (
    <div className="sub-style-panel">
      <div className="sub-style-row">
        <label>font size</label>
        <input
          type="range" min={12} max={32} step={1}
          value={style.fontSize}
          onChange={(e) => onChange({ ...style, fontSize: parseInt(e.target.value, 10) })}
        />
        <span>{style.fontSize}px</span>
      </div>
      <div className="sub-style-row">
        <label>color</label>
        <input
          type="color"
          value={style.color}
          onChange={(e) => onChange({ ...style, color: e.target.value })}
        />
      </div>
      <div className="sub-style-row">
        <label>bg opacity</label>
        <input
          type="range" min={0} max={1} step={0.05}
          value={style.bgOpacity}
          onChange={(e) => onChange({ ...style, bgOpacity: parseFloat(e.target.value) })}
        />
        <span>{Math.round(style.bgOpacity * 100)}%</span>
      </div>
      <div className="sub-style-row">
        <button
          type="button"
          className="extra-btn"
          onClick={() => onChange(DEFAULT_SUB_STYLE)}
        >reset</button>
      </div>
    </div>
  )
}
