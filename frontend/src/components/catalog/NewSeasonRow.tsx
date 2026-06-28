import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'

/**
 * Inline row at the bottom of an expanded series card for adding a new
 * season. Season number defaults to max(existing) + 1 so the admin
 * usually only types the (optional) title.
 */
export function NewSeasonRow({
  existing,
  busy,
  onCreate,
}: {
  existing: number[]
  busy: boolean
  onCreate: (seasonNumber: number, title: string) => void
}) {
  const suggested = existing.length === 0 ? 1 : Math.max(...existing) + 1
  const [num, setNum] = useState<string>(String(suggested))
  const [title, setTitle] = useState('')

  // Keep the number input synced with the suggested default until the
  // user edits it themselves (then their edit sticks until they pick
  // a different series card).
  useEffect(() => {
    setNum(String(suggested))
  }, [suggested])

  function submit() {
    const n = parseInt(num, 10)
    if (!Number.isFinite(n) || n < 1) return
    if (existing.includes(n)) return
    onCreate(n, title)
    setTitle('')
  }

  const n = parseInt(num, 10)
  const dup = Number.isFinite(n) && existing.includes(n)
  return (
    <div className="catalog-new-season">
      <div className="catalog-new-season-num">
        <span className="catalog-new-season-label">S</span>
        <input
          type="number"
          min={1}
          value={num}
          onChange={(e) => setNum(e.target.value)}
          title="Season number"
        />
      </div>
      <input
        className="catalog-new-season-title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title (optional)"
        onKeyDown={(e) => { if (e.key === 'Enter') submit() }}
      />
      <button
        type="button"
        disabled={busy || !Number.isFinite(n) || n < 1 || dup}
        onClick={submit}
        title={dup ? `Season ${n} already exists` : 'Add season'}
      >
        <Plus size={12} />
        Add season
      </button>
    </div>
  )
}
