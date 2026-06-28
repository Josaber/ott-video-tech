import { Asset, EditorialState } from '../../api/client'

const CATEGORIES = ['Drama', 'Documentary', 'Sports', 'Live', 'Kids', 'Other'] as const

/**
 * Admin-only editorial row: state machine buttons (Draft → In Review →
 * Ready) plus a category picker. The state-machine arrows are driven by
 * the asset's current editorialState — never offer a transition that's
 * not allowed by the backend's EditorialState.canTransitionTo.
 */
export function EditorialBar({
  asset,
  busy,
  onTransition,
  onChangeCategory,
}: {
  asset: Asset
  busy: boolean
  onTransition: (target: EditorialState) => void
  onChangeCategory: (value: string) => void
}) {
  return (
    <div className="editorial-bar">
      <span className="editorial-label">editorial</span>
      {asset.editorialState === 'DRAFT' && (
        <button className="secondary" disabled={busy} onClick={() => onTransition('IN_REVIEW')}>
          Submit for review →
        </button>
      )}
      {asset.editorialState === 'IN_REVIEW' && (
        <>
          <button className="secondary" disabled={busy} onClick={() => onTransition('READY')}>
            ✓ Approve
          </button>
          <button className="secondary" disabled={busy} onClick={() => onTransition('DRAFT')}>
            ← Request changes
          </button>
        </>
      )}
      {asset.editorialState === 'READY' && (
        <button className="secondary" disabled={busy} onClick={() => onTransition('DRAFT')}>
          ← Un-approve
        </button>
      )}
      <select
        className="category-select"
        value={asset.category ?? ''}
        onChange={(e) => onChangeCategory(e.target.value)}
        disabled={busy}
      >
        <option value="">(no category)</option>
        {CATEGORIES.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>
    </div>
  )
}
