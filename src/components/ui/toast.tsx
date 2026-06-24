// Sistema de toast imperativo. `toast(opts)` pode ser chamado de qualquer lugar;
// <ToastHost /> (montado uma vez no shell) renderiza a fila no canto da tela.
import { useEffect, useState, type ReactNode } from 'react'
import { Toast, type ToastTone } from '@/components/ds'

export interface ToastOptions {
  tone?: ToastTone
  title?: ReactNode
  body?: ReactNode
  duration?: number
}

interface ToastItem extends ToastOptions {
  id: string
}

type Listener = (item: ToastItem) => void

let listener: Listener | null = null

export function toast(opts: ToastOptions): void {
  const item: ToastItem = { id: Math.random().toString(36).slice(2), ...opts }
  listener?.(item)
}

export function ToastHost() {
  const [items, setItems] = useState<ToastItem[]>([])

  useEffect(() => {
    listener = (item) => {
      setItems((xs) => [...xs, item])
      const ttl = item.duration ?? 3800
      setTimeout(() => setItems((xs) => xs.filter((x) => x.id !== item.id)), ttl)
    }
    return () => {
      listener = null
    }
  }, [])

  return (
    <div
      style={{
        position: 'fixed',
        right: 24,
        bottom: 24,
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        alignItems: 'flex-end',
      }}
    >
      {items.map((it) => (
        <div key={it.id} style={{ animation: 'rcToastIn 220ms cubic-bezier(0.16,1,0.3,1)' }}>
          <Toast
            tone={it.tone ?? 'success'}
            title={it.title}
            onClose={() => setItems((xs) => xs.filter((x) => x.id !== it.id))}
          >
            {it.body}
          </Toast>
        </div>
      ))}
    </div>
  )
}
