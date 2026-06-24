// Contexto de sessão. Guarda o token (via localStorage) e os dados do usuário
// autenticado (obtidos em /v1/auth/me). O papel da navegação vem daqui — não de
// estado local nem de "trocar de visão" como no protótipo.
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { getMe, login as loginRequest } from '@/api/auth'
import { UNAUTHORIZED_EVENT } from '@/lib/api'
import { clearToken, getToken, setToken } from '@/lib/token'
import type { User } from '@/types/models'

type Status = 'loading' | 'authenticated' | 'unauthenticated'

interface AuthContextValue {
  status: Status
  user: User | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const [status, setStatus] = useState<Status>(() =>
    getToken() ? 'loading' : 'unauthenticated',
  )
  const [user, setUser] = useState<User | null>(null)

  const logout = useCallback(() => {
    clearToken()
    setUser(null)
    setStatus('unauthenticated')
    queryClient.clear()
  }, [queryClient])

  // Reidrata a sessão ao montar: se há token, busca /me; senão, desloga.
  useEffect(() => {
    if (!getToken()) {
      setStatus('unauthenticated')
      return
    }
    let active = true
    getMe()
      .then((me) => {
        if (!active) return
        setUser(me)
        setStatus('authenticated')
      })
      .catch(() => {
        if (!active) return
        logout()
      })
    return () => {
      active = false
    }
  }, [logout])

  // Token expirado/ inválido detectado pelo interceptor -> desloga.
  useEffect(() => {
    const onUnauthorized = () => logout()
    window.addEventListener(UNAUTHORIZED_EVENT, onUnauthorized)
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized)
  }, [logout])

  const login = useCallback(async (email: string, password: string) => {
    const response = await loginRequest({ email, password })
    setToken(response.token)
    const me = await getMe()
    setUser(me)
    setStatus('authenticated')
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({ status, user, login, logout }),
    [status, user, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de <AuthProvider>.')
  return ctx
}
