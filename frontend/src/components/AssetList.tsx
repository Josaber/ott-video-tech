import { Asset } from '../api/client'

interface Props {
  assets: Asset[]
  selected: string | null
  onSelect: (id: string) => void
}

export function AssetList({ assets, selected, onSelect }: Props) {
  if (assets.length === 0) {
    return <div className="empty">No assets yet. Create one above.</div>
  }
  return (
    <div className="asset-list">
      {assets.map((a) => (
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
  )
}
