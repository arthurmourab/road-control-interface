// Guardas de rota: autenticação, autorização por papel e redirecionamento inicial.
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { LoadingState } from '@/components/ui'
import { useAuth } from '@/lib/auth'
import { DEFAULT_ROUTE } from './nav'
import type { Role } from '@/types/enums'

// Exige sessão. Enquanto reidrata (/auth/me), mostra carregando.
export function RequireAuth() {
  const { status } = useAuth()
  const location = useLocation()
  if (status === 'loading') {
    return (
      <div style={{ display: 'grid', placeItems: 'center', height: '100%' }}>
        <LoadingState label="Carregando sua sessão…" />
      </div>
    )
  }
  if (status === 'unauthenticated') {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }
  return <Outlet />
}

// Restringe um grupo de rotas a papéis específicos. Papel sem acesso vai para
// a tela inicial do próprio papel.
export function RequireRole({ roles }: { roles: Role[] }) {
  const { user } = useAuth()
  if (!user) return null
  if (!roles.includes(user.role)) {
    return <Navigate to={DEFAULT_ROUTE[user.role]} replace />
  }
  return <Outlet />
}

// Redireciona "/" para a tela inicial do papel.
export function HomeRedirect() {
  const { user } = useAuth()
  if (!user) return null
  return <Navigate to={DEFAULT_ROUTE[user.role]} replace />
}
