// Peças menores de UI: cabeçalho de página, busca, badges de status/papel,
// grade de detalhes e chip de placa.
import { useState, type ReactNode } from 'react'
import { Badge, Icon } from '@/components/ds'
import { ROLE_LABELS, type Role } from '@/types/enums'

// ---------------------------------------------------------------- PageHeader
export interface PageHeaderProps {
  title: ReactNode
  subtitle?: ReactNode
  actions?: ReactNode
}

export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        gap: 16,
        marginBottom: 4,
        flexWrap: 'wrap',
      }}
    >
      <div style={{ minWidth: 0 }}>
        <h1
          style={{
            margin: 0,
            fontFamily: 'var(--font-display)',
            fontSize: 26,
            fontWeight: 600,
            color: 'var(--text-primary)',
            letterSpacing: '-0.015em',
          }}
        >
          {title}
        </h1>
        {subtitle && (
          <div style={{ fontSize: 14.5, color: 'var(--text-secondary)', marginTop: 4 }}>{subtitle}</div>
        )}
      </div>
      {actions && <div style={{ display: 'flex', gap: 10, flex: 'none' }}>{actions}</div>}
    </div>
  )
}

// ---------------------------------------------------------------- SearchInput
export interface SearchInputProps {
  placeholder?: string
  value: string
  onChange: (value: string) => void
  width?: number | string
}

export function SearchInput({ placeholder = 'Buscar…', value, onChange, width = 280 }: SearchInputProps) {
  const [focused, setFocused] = useState(false)
  return (
    <label
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        height: 40,
        width,
        padding: '0 12px',
        background: 'var(--white)',
        border: `1px solid ${focused ? 'var(--signal-amber)' : 'var(--border-default)'}`,
        borderRadius: 'var(--radius-md)',
        boxShadow: focused ? '0 0 0 3px rgba(255,159,28,0.18)' : 'none',
        transition: 'border-color 120ms, box-shadow 120ms',
      }}
    >
      <Icon name="search" size={17} color="var(--text-muted)" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        style={{
          flex: 1,
          minWidth: 0,
          border: 'none',
          outline: 'none',
          background: 'transparent',
          fontFamily: 'var(--font-sans)',
          fontSize: 14,
          color: 'var(--text-primary)',
        }}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Limpar"
          style={{
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            color: 'var(--text-muted)',
            display: 'grid',
            placeItems: 'center',
            padding: 0,
          }}
        >
          <Icon name="x" size={15} color="var(--text-muted)" />
        </button>
      )}
    </label>
  )
}

// ---------------------------------------------------------------- Badges
export function StatusBadge({ active }: { active: boolean }) {
  return <Badge tone={active ? 'green' : 'neutral'} dot>{active ? 'Ativo' : 'Inativo'}</Badge>
}

export function ScopeBadge({ global }: { global: boolean }) {
  return <Badge tone={global ? 'amber' : 'neutral'} dot>{global ? 'Global' : 'Vinculado'}</Badge>
}

export function RoleBadge({ role }: { role: Role }) {
  const label = role === 'SystemAdmin' ? 'Administrador' : ROLE_LABELS[role]
  return <Badge tone="neutral">{label}</Badge>
}

// ---------------------------------------------------------------- DetailGrid / Field
export function DetailGrid({ children, cols = 2 }: { children: ReactNode; cols?: number }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, minmax(0,1fr))`,
        gap: '18px 28px',
      }}
    >
      {children}
    </div>
  )
}

export function Field({
  label,
  children,
  mono,
  full,
}: {
  label: ReactNode
  children: ReactNode
  mono?: boolean
  full?: boolean
}) {
  return (
    <div style={{ gridColumn: full ? '1 / -1' : 'auto' }}>
      <div
        style={{
          fontSize: 12,
          fontWeight: 600,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          color: 'var(--text-muted)',
          marginBottom: 5,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 15.5,
          color: 'var(--text-primary)',
          fontFamily: mono ? 'var(--font-number)' : 'var(--font-sans)',
          fontWeight: mono ? 500 : 400,
        }}
      >
        {children}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------- Plate
export function Plate({ children }: { children: ReactNode }) {
  return (
    <span
      style={{
        fontFamily: 'var(--font-number)',
        fontWeight: 600,
        fontSize: 14,
        letterSpacing: '0.02em',
        color: 'var(--text-primary)',
      }}
    >
      {children}
    </span>
  )
}
