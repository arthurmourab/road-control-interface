// Sidebar escura, navegação por papel, recolhível.
// Estados hover/ativo via CSS (classe .rc-nav-link em global.css); layout inline.
import { NavLink } from 'react-router-dom'
import { Icon } from '@/components/ds'
import { NAV } from './nav'
import type { Role } from '@/types/enums'

export function Sidebar({ role, collapsed }: { role: Role; collapsed: boolean }) {
  const items = NAV[role] ?? []
  const width = collapsed ? 76 : 248
  return (
    <aside
      style={{
        width,
        flex: 'none',
        height: '100%',
        background: 'var(--ink-navy)',
        color: 'var(--white)',
        display: 'flex',
        flexDirection: 'column',
        padding: collapsed ? '20px 12px' : '20px 14px',
        boxSizing: 'border-box',
        transition: 'width 200ms cubic-bezier(0.4,0,0.2,1)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: collapsed ? '4px 4px 22px' : '4px 8px 22px',
          justifyContent: collapsed ? 'center' : 'flex-start',
        }}
      >
        <img
          src="/assets/roadcontrol-symbol-reverse.svg"
          alt=""
          style={{ width: 30, height: 30, flex: 'none' }}
        />
        {!collapsed && (
          <img
            src="/assets/roadcontrol-logo-horizontal-reverse.svg"
            alt="RoadControl"
            style={{ height: 18 }}
          />
        )}
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {items.map((it) => (
          <NavLink
            key={it.to}
            to={it.to}
            end={it.to.split('/').length <= 2}
            className="rc-nav-link"
            title={collapsed ? it.label : undefined}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 11,
              padding: collapsed ? '11px 0' : '10px 12px',
              justifyContent: collapsed ? 'center' : 'flex-start',
              borderRadius: 'var(--radius-md)',
              fontFamily: 'var(--font-sans)',
              fontSize: 14.5,
              textDecoration: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            {({ isActive }) => (
              <>
                <Icon name={it.icon} size={20} stroke={isActive ? 2 : 1.75} />
                {!collapsed && it.label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div style={{ marginTop: 'auto' }}>
        {!collapsed && (
          <div
            style={{
              padding: '13px 12px',
              borderTop: '1px solid rgba(255,255,255,0.08)',
              display: 'flex',
              alignItems: 'center',
              gap: 9,
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: 'var(--go-green)',
                flex: 'none',
              }}
            />
            <span style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.62)' }}>Conectado</span>
          </div>
        )}
      </div>
    </aside>
  )
}
