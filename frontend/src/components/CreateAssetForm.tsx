import { useState } from 'react'
import { Plus } from 'lucide-react'
import { api } from '../api/client'

interface Props {
  onCreated: () => void
}

export function CreateAssetForm({ onCreated }: Props) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit() {
    if (!title.trim()) return
    setBusy(true)
    try {
      await api.create({ title: title.trim(), description: description.trim() || undefined })
      setTitle('')
      setDescription('')
      onCreated()
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <label>Title</label>
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="My demo video" />
      <label>Description</label>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Optional"
        rows={2}
      />
      <div style={{ marginTop: 12 }}>
        <button disabled={busy || !title.trim()} onClick={submit}>
          <Plus size={14} />
          Create asset
        </button>
      </div>
    </div>
  )
}
