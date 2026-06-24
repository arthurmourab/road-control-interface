// Navegação: Avatar e Tabs. Portados do bundle.
import { useState, type CSSProperties, type ReactNode } from 'react'

// ---------------------------------------------------------------- Avatar
type AvatarSize = 'sm' | 'md' | 'lg'
type AvatarTone = 'navy' | 'amber' | 'slate'

const avatarSizes: Record<AvatarSize, number> = { sm: 28, md: 36, lg: 44 }

const avatarTones: Record<AvatarTone, { bg: string; fg: string }> = {
  navy: { bg: 'var(--ink-navy)', fg: 'var(--white)' },
  amber: { bg: 'var(--amber-100)', fg: 'var(--amber-700)' },
  slate: { bg: 'var(--gray-200)', fg: 'var(--gray-700)' },
}

function initials(name = ''): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export interface AvatarProps {
  name?: string
  src?: string
  size?: AvatarSize
  tone?: AvatarTone
  style?: CSSProperties
}

export function Avatar({ name = '', src, size = 'md', tone = 'navy', style }: AvatarProps) {
  const px = avatarSizes[size] ?? avatarSizes.md
  const t = avatarTones[tone] ?? avatarTones.navy
  return (
    <span
      title={name || undefined}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: px,
        height: px,
        flex: 'none',
        borderRadius: '50%',
        overflow: 'hidden',
        background: src ? 'var(--gray-100)' : t.bg,
        color: t.fg,
        fontFamily: 'var(--font-sans)',
        fontWeight: 600,
        fontSize: Math.round(px * 0.4),
        lineHeight: 1,
        userSelect: 'none',
        ...style,
      }}
    >
      {src ? (
        <img src={src} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        initials(name)
      )}
    </span>
  )
}

// ---------------------------------------------------------------- Tabs
export type TabItem = string | { value: string; label: ReactNode; count?: number }

export interface TabsProps {
  tabs?: TabItem[]
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  style?: CSSProperties
}

export function Tabs({ tabs = [], value, defaultValue, onChange, style }: TabsProps) {
  const first = tabs[0] && (typeof tabs[0] === 'string' ? tabs[0] : tabs[0].value)
  const [internal, setInternal] = useState<string>(defaultValue ?? first ?? '')
  const active = value !== undefined ? value : internal
  const select = (v: string) => {
    if (value === undefined) setInternal(v)
    onChange?.(v)
  }
  return (
    <div
      role="tablist"
      style={{
        display: 'flex',
        gap: 4,
        borderBottom: '1px solid var(--border-subtle)',
        fontFamily: 'var(--font-sans)',
        ...style,
      }}
    >
      {tabs.map((t) => {
        const val = typeof t === 'string' ? t : t.value
        const label = typeof t === 'string' ? t : t.label
        const count = typeof t === 'object' ? t.count : undefined
        const on = val === active
        return (
          <button
            key={val}
            type="button"
            role="tab"
            aria-selected={on}
            onClick={() => select(val)}
            style={{
              position: 'relative',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 7,
              padding: '10px 12px',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              fontFamily: 'var(--font-sans)',
              fontSize: 15,
              fontWeight: on ? 600 : 500,
              color: on ? 'var(--text-primary)' : 'var(--text-secondary)',
              borderBottom: on ? '2px solid var(--signal-amber)' : '2px solid transparent',
              marginBottom: -1,
              transition: 'color var(--dur-fast) var(--ease-standard)',
            }}
          >
            {label}
            {count !== undefined && (
              <span
                style={{
                  fontFamily: 'var(--font-number)',
                  fontSize: 12,
                  fontWeight: 600,
                  padding: '1px 7px',
                  borderRadius: 'var(--radius-pill)',
                  background: on ? 'var(--amber-50)' : 'var(--gray-100)',
                  color: on ? 'var(--amber-700)' : 'var(--text-secondary)',
                }}
              >
                {count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
