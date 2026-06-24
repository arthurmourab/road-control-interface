// Modal centralizado + ConfirmDialog. Fecha no Esc e no clique do backdrop.
import { useEffect, type ReactNode } from 'react'
import { Button, Icon, IconButton } from '@/components/ds'

export interface ModalProps {
  open: boolean
  title?: ReactNode
  subtitle?: ReactNode
  onClose?: () => void
  children?: ReactNode
  footer?: ReactNode
  width?: number
}

export function Modal({ open, title, subtitle, onClose, children, footer, width = 540 }: ModalProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose?.()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null
  return (
    <div
      onMouseDown={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 900,
        background: 'rgba(14,27,44,0.42)',
        display: 'grid',
        placeItems: 'center',
        padding: 24,
        animation: 'rcFade 160ms ease-out',
      }}
    >
      <div
        onMouseDown={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        style={{
          width,
          maxWidth: '100%',
          maxHeight: 'calc(100vh - 48px)',
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--white)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-lg)',
          overflow: 'hidden',
          animation: 'rcModalIn 200ms cubic-bezier(0.16,1,0.3,1)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 16,
            padding: '20px 22px',
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2
              style={{
                margin: 0,
                fontFamily: 'var(--font-display)',
                fontSize: 19,
                fontWeight: 600,
                color: 'var(--text-primary)',
              }}
            >
              {title}
            </h2>
            {subtitle && (
              <div style={{ fontSize: 13.5, color: 'var(--text-secondary)', marginTop: 3 }}>
                {subtitle}
              </div>
            )}
          </div>
          {onClose && (
            <IconButton label="Fechar" variant="ghost" size="sm" onClick={onClose}>
              <Icon name="x" size={19} color="var(--text-strong)" />
            </IconButton>
          )}
        </div>
        <div style={{ padding: 22, overflow: 'auto' }}>{children}</div>
        {footer && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 10,
              padding: '16px 22px',
              borderTop: '1px solid var(--border-subtle)',
              background: 'var(--surface-sunken)',
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

export interface ConfirmDialogProps {
  open: boolean
  tone?: 'danger' | 'amber'
  icon?: string
  title?: ReactNode
  body?: ReactNode
  confirmLabel?: string
  cancelLabel?: string
  loading?: boolean
  onConfirm?: () => void
  onClose?: () => void
}

export function ConfirmDialog({
  open,
  tone = 'danger',
  icon = 'alert-triangle',
  title,
  body,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  loading = false,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  const accent =
    tone === 'danger'
      ? { bg: 'var(--red-50)', border: 'var(--red-100)', fg: 'var(--red-600)' }
      : { bg: 'var(--amber-50)', border: 'var(--amber-100)', fg: 'var(--amber-700)' }
  return (
    <Modal
      open={open}
      onClose={onClose}
      width={460}
      title={
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 12 }}>
          <span
            style={{
              display: 'grid',
              placeItems: 'center',
              width: 38,
              height: 38,
              borderRadius: 10,
              background: accent.bg,
              border: `1px solid ${accent.border}`,
            }}
          >
            <Icon name={icon} size={20} color={accent.fg} />
          </span>
          <span>{title}</span>
        </span>
      }
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            variant={tone === 'danger' ? 'danger' : 'primary'}
            onClick={onConfirm}
            disabled={loading}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div style={{ fontSize: 14.5, color: 'var(--text-secondary)', lineHeight: 1.55 }}>{body}</div>
    </Modal>
  )
}
