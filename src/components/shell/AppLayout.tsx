// Casca da aplicação: sidebar + topbar + área de conteúdo roteada.
import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { useAuth } from '@/lib/auth'

export function AppLayout() {
  const { user } = useAuth()
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()
  if (!user) return null

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      <Sidebar role={user.role} collapsed={collapsed} />
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          height: '100%',
        }}
      >
        <Topbar collapsed={collapsed} onToggleCollapse={() => setCollapsed((c) => !c)} />
        <main
          key={location.pathname}
          style={{
            flex: 1,
            overflow: 'auto',
            padding: '28px 32px 48px',
            animation: 'rcScreenIn 240ms ease-out',
          }}
        >
          <div style={{ maxWidth: 1240, margin: '0 auto' }}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
