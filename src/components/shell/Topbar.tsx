// Topbar: recolher menu, notificações e menu do usuário (com sair).
import { useEffect, useRef, useState } from 'react'
import { Avatar, Icon, IconButton } from '@/components/ds'
import { ROLE_LABELS } from '@/types/enums'
import { useAuth } from '@/lib/auth'

export function Topbar({
  collapsed,
  onToggleCollapse,
}: {
  collapsed: boolean
  onToggleCollapse: () => void
}) {
  const { user, logout } = useAuth()
  const [menu, setMenu] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setMenu(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  if (!user) return null
  const fullName = `${user.name} ${user.lastName}`.trim()
  const roleLabel = ROLE_LABELS[user.role]
  const tone = user.role === 'SystemAdmin' ? 'amber' : user.role === 'Driver' ? 'slate' : 'navy'

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        padding: '12px 24px',
        background: 'var(--white)',
        borderBottom: '1px solid var(--border-subtle)',
        flex: 'none',
      }}
    >
      <IconButton
        label={collapsed ? 'Expandir menu' : 'Recolher menu'}
        variant="ghost"
        onClick={onToggleCollapse}
      >
        <Icon name={collapsed ? 'panel-left-open' : 'panel-left-close'} size={20} color="var(--text-strong)" />
      </IconButton>

      <div style={{ flex: 1 }} />

      <IconButton variant="outline" label="Notificações">
        <span style={{ position: 'relative', display: 'grid', placeItems: 'center' }}>
          <Icon name="bell" size={19} color="var(--text-strong)" />
          <span
            style={{
              position: 'absolute',
              top: -2,
              right: -2,
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: 'var(--signal-amber)',
              border: '1.5px solid var(--white)',
            }}
          />
        </span>
      </IconButton>

      <div ref={ref} style={{ position: 'relative' }}>
        <button
          type="button"
          onClick={() => setMenu((m) => !m)}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-sunken)')}
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = menu ? 'var(--surface-sunken)' : 'transparent')
          }
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 11,
            padding: '5px 8px 5px 6px',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-pill)',
            background: menu ? 'var(--surface-sunken)' : 'transparent',
            cursor: 'pointer',
            transition: 'background 120ms',
          }}
        >
          <Avatar name={fullName} tone={tone} size="sm" />
          <span style={{ textAlign: 'left', lineHeight: 1.2 }}>
            <span style={{ display: 'block', fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)' }}>
              {fullName}
            </span>
            <span style={{ display: 'block', fontSize: 11.5, color: 'var(--text-secondary)' }}>
              {roleLabel}
            </span>
          </span>
          <Icon name="chevron-down" size={16} color="var(--text-muted)" style={{ marginRight: 2 }} />
        </button>

        {menu && (
          <div
            style={{
              position: 'absolute',
              right: 0,
              top: 'calc(100% + 8px)',
              width: 278,
              background: 'var(--white)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-lg)',
              zIndex: 800,
              overflow: 'hidden',
              animation: 'rcModalIn 160ms cubic-bezier(0.16,1,0.3,1)',
            }}
          >
            <div
              style={{
                padding: '14px 16px',
                borderBottom: '1px solid var(--border-subtle)',
                display: 'flex',
                gap: 11,
                alignItems: 'center',
              }}
            >
              <Avatar name={fullName} tone={tone} size="md" />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{fullName}</div>
                <div style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>{user.email}</div>
              </div>
            </div>
            <div style={{ padding: '6px 10px 10px' }}>
              <button
                type="button"
                onClick={() => {
                  setMenu(false)
                  logout()
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--red-50)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  width: '100%',
                  padding: '9px 8px',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  background: 'transparent',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontFamily: 'var(--font-sans)',
                  fontSize: 13.5,
                  fontWeight: 600,
                  color: 'var(--red-600)',
                  transition: 'background 120ms',
                }}
              >
                <Icon name="log-out" size={17} color="var(--red-600)" />
                Sair
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
