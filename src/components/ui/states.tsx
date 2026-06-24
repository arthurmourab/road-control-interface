// Estados de bloco: spinner, vazio, erro, carregando. Usados dentro de cards/páginas.
import type { ReactNode } from 'react'
import { Button, Icon } from '@/components/ds'

export function Spinner({ size = 22, color = 'var(--signal-amber)' }: { size?: number; color?: string }) {
  return (
    <span
      style={{
        display: 'inline-block',
        width: size,
        height: size,
        border: '2.5px solid var(--gray-200)',
        borderTopColor: color,
        borderRadius: '50%',
        animation: 'rcSpin 720ms linear infinite',
      }}
    />
  )
}

export interface EmptyStateProps {
  icon?: string
  title: ReactNode
  body?: ReactNode
  action?: ReactNode
}

export function EmptyState({ icon = 'inbox', title, body, action }: EmptyStateProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '56px 24px',
        gap: 6,
      }}
    >
      <span
        style={{
          display: 'grid',
          placeItems: 'center',
          width: 56,
          height: 56,
          borderRadius: 16,
          background: 'var(--surface-sunken)',
          border: '1px solid var(--border-subtle)',
          marginBottom: 8,
        }}
      >
        <Icon name={icon} size={26} color="var(--text-muted)" />
      </span>
      <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>{title}</div>
      {body && (
        <div style={{ fontSize: 14, color: 'var(--text-secondary)', maxWidth: 380, lineHeight: 1.5 }}>
          {body}
        </div>
      )}
      {action && <div style={{ marginTop: 12 }}>{action}</div>}
    </div>
  )
}

export interface ErrorStateProps {
  title?: ReactNode
  body?: ReactNode
  onRetry?: () => void
}

export function ErrorState({
  title = 'Não foi possível carregar',
  body = 'Algo deu errado ao buscar os dados. Tente novamente.',
  onRetry,
}: ErrorStateProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '56px 24px',
        gap: 6,
      }}
    >
      <span
        style={{
          display: 'grid',
          placeItems: 'center',
          width: 56,
          height: 56,
          borderRadius: 16,
          background: 'var(--red-50)',
          border: '1px solid var(--red-100)',
          marginBottom: 8,
        }}
      >
        <Icon name="cloud-off" size={26} color="var(--red-600)" />
      </span>
      <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>{title}</div>
      <div style={{ fontSize: 14, color: 'var(--text-secondary)', maxWidth: 380, lineHeight: 1.5 }}>
        {body}
      </div>
      {onRetry && (
        <div style={{ marginTop: 12 }}>
          <Button
            variant="outline"
            size="sm"
            iconLeft={<Icon name="rotate-cw" size={16} color="var(--text-strong)" />}
            onClick={onRetry}
          >
            Tentar de novo
          </Button>
        </div>
      )}
    </div>
  )
}

export function LoadingState({ label = 'Carregando…' }: { label?: string }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '56px 24px',
        gap: 14,
      }}
    >
      <Spinner size={28} />
      <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{label}</div>
    </div>
  )
}
