import { useMemo, useState } from 'react'
import { Asset } from '../api/client'

interface Props {
  assets: Asset[]
  selected: string | null
  onSelect: (id: string) => void
}

const CATEGORY_OPTIONS = ['All', 'Drama', 'Documentary', 'Sports', 'Live', 'Kids', 'Other', 'Uncategorised'] as const
type CategoryFilter = typeof CATEGORY_OPTIONS[number]

export function AssetList({ assets, selected, onSelect }: Props) {
  const [filter, setFilter] = useState<CategoryFilter>('All')

  const filtered = useMemo(() => {
    if (filter === 'All') return assets
    if (filter === 'Uncategorised') return assets.filter((a) => !a.category)
    return assets.filter((a) => a.category === filter)
  }, [assets, filter])

  if (assets.length === 0) {
    return <div className="empty">No assets yet. Create one above.</div>
  }
  return (
    <>
      <div className="category-chips">
        {CATEGORY_OPTIONS.map((c) => (
          <button
            key={c}
            className={'category-chip' + (c === filter ? ' active' : '')}
            onClick={() => setFilter(c)}
          >
            {c}
          </button>
        ))}
      </div>
      <div className="asset-list">
        {filtered.length === 0 && (
          <div className="empty">No assets in “{filter}”.</div>
        )}
        {filtered.map((a) => (
          <div
            key={a.id}
            className={'asset-row' + (a.id === selected ? ' active' : '')}
            onClick={() => onSelect(a.id)}
          >
            <span className="asset-row-title" title={a.title}>{a.title}</span>
            <span className={'status ' + a.status}>{a.status}</span>
          </div>
        ))}
      </div>
    </>
  )
}
