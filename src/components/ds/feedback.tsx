// Feedback: Alert (inline) e Toast (overlay). Portados do bundle.
import type { HTMLAttributes, ReactNode } from 'react'

type AlertTone = 'info' | 'success' | 'warning' | 'error'

const alertTones: Record<AlertTone, { bg: string; border: string; accent: string }> = {
  info: { bg: 'var(--surface-sunken)', border: 'var(--border-default)', accent: 'var(--slate)' },
  success: { bg: 'var(--green-50)', border: 'var(--green-100)', accent: 'var(--green-700)' },
  warning: { bg: 'var(--amber-50)', border: 'var(--amber-100)', accent: 'var(--amber-700)' },
  error: { bg: 'var(--red-50)', border: 'var(--red-100)', accent: 'var(--red-600)' },
}

const alertGlyphs: Record<AlertTone, string> = {
  info: 'M10 9v5M10 6.2v.2',
  success: 'M5.5 10.2L8.7 13.4L14.8 6.6',
  warning: 'M10 6v5M10 13.8v.2',
  error: 'M7 7l6 6M13 7l-6 6',
}

export interface AlertProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  tone?: AlertTone
  title?: ReactNode
  onClose?: () => void
  action?: ReactNode
}

export function Alert({ tone = 'info', title, children, onClose, action, style, ...rest }: AlertProps) {
  const t = alertTones[tone] ?? alertTones.info
  return (
    <div
      role="status"
      style={{
        display: 'flex',
        gap: 12,
        padding: '14px 16px',
        background: t.bg,
        border: `1px solid ${t.border}`,
        borderRadius: 'var(--radius-lg)',
        fontFamily: 'var(--font-sans)',
        color: 'var(--text-primary)',
        ...style,
      }}
      {...rest}
    >
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ flex: 'none', marginTop: 1 }} aria-hidden>
        <circle cx="10" cy="10" r="8.25" fill="none" stroke={t.accent} strokeWidth="1.5" />
        <path
          d={alertGlyphs[tone]}
          stroke={t.accent}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <div style={{ flex: 1, minWidth: 0 }}>
        {title && (
          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: children ? 3 : 0 }}>{title}</div>
        )}
        {children && (
          <div style={{ fontSize: 14, lineHeight: 1.45, color: 'var(--text-secondary)' }}>{children}</div>
        )}
        {action && <div style={{ marginTop: 10 }}>{action}</div>}
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar"
          style={{
            flex: 'none',
            width: 24,
            height: 24,
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            color: 'var(--text-muted)',
            fontSize: 18,
            lineHeight: 1,
            padding: 0,
          }}
        >
          ×
        </button>
      )}
    </div>
  )
}

// ---------------------------------------------------------------- Toast
export type ToastTone = 'success' | 'error' | 'info'

const toastDots: Record<ToastTone, string> = {
  success: 'var(--go-green)',
  error: 'var(--red-500)',
  info: 'var(--signal-amber)',
}

export interface ToastProps {
  tone?: ToastTone
  title?: ReactNode
  children?: ReactNode
  onClose?: () => void
}

export function Toast({ tone = 'success', title, children, onClose }: ToastProps) {
  return (
    <div
      role="status"
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
        width: 360,
        maxWidth: '100%',
        padding: '14px 16px',
        background: 'var(--ink-navy)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-lg)',
        fontFamily: 'var(--font-sans)',
        color: 'var(--white)',
      }}
    >
      <span
        style={{
          flex: 'none',
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: toastDots[tone],
          marginTop: 6,
        }}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        {title && <div style={{ fontWeight: 600, fontSize: 15 }}>{title}</div>}
        {children && (
          <div
            style={{
              fontSize: 14,
              lineHeight: 1.45,
              color: 'rgba(255,255,255,0.72)',
              marginTop: title ? 2 : 0,
            }}
          >
            {children}
          </div>
        )}
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar"
          style={{
            flex: 'none',
            width: 22,
            height: 22,
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            color: 'rgba(255,255,255,0.6)',
            fontSize: 18,
            lineHeight: 1,
            padding: 0,
          }}
        >
          ×
        </button>
      )}
    </div>
  )
}
