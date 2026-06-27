import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

export type ToastKind = 'info' | 'success' | 'error'
export interface Toast {
  id: number
  kind: ToastKind
  message: string
}

interface ToastApi {
  push: (kind: ToastKind, message: string) => void
}

const Ctx = createContext<ToastApi | null>(null)

let nextId = 1

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const remove = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])
  const api = useMemo<ToastApi>(() => ({
    push: (kind, message) => {
      const id = nextId++
      setToasts((prev) => [...prev, { id, kind, message }])
      window.setTimeout(() => remove(id), 3500)
    },
  }), [remove])

  return (
    <Ctx.Provider value={api}>
      {children}
      <div className="toast-stack">
        {toasts.map((t) => (
          <div key={t.id} className={'toast toast-' + t.kind} onClick={() => remove(t.id)}>
            {t.message}
          </div>
        ))}
      </div>
    </Ctx.Provider>
  )
}

export function useToast(): ToastApi {
  const ctx = useContext(Ctx)
  if (!ctx) {
    // Soft fallback so leaf components don't blow up in isolated tests.
    return { push: (kind, msg) => {
      // eslint-disable-next-line no-console
      console.log(`[toast ${kind}] ${msg}`)
    } }
  }
  return ctx
}

// Required by react-refresh and ESLint when same file exports a context + a hook.
export { Ctx as ToastContext }

// Re-export to allow consumers that want the raw provider state.
export type { Toast as ToastEntry }

// Keep a no-op effect import marker so tree-shaking doesn't drop this file
// when only the provider is used without the hook in another bundle slice.
// (Defensive — Vite handles this fine, but stable across bundlers.)
void useEffect
