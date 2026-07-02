import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { LoginRequest, LoginResponse, User } from '@/types/models'

// POST /v1/auth — autentica e retorna o token + dados básicos.
export function login(payload: LoginRequest): Promise<LoginResponse> {
  return api.post<LoginResponse>('/v1/auth', payload)
}

// GET /v1/auth/me — dados do usuário autenticado (papel + organização),
// usado para montar o contexto da sessão.
export function getMe(): Promise<User> {
  return api.get<User>('/v1/auth/me')
}

// POST /v1/auth/reset-password — anônimo; redefine a senha para a provisória.
// Retorna sempre 200 com mensagem genérica (não revela se o e-mail existe).
// O `data` do envelope não carrega payload tipado relevante.
function resetPassword(email: string): Promise<unknown> {
  return api.post<unknown>('/v1/auth/reset-password', { email })
}

export function useResetPassword() {
  // Sem invalidação de cache: a operação não altera dados listados no front.
  return useMutation({ mutationFn: resetPassword })
}

// POST /v1/auth/change-password — autenticado; troca a senha do usuário logado.
// Senha atual incorreta -> 422 (ApiError com a mensagem do backend).
export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}

function changePassword(payload: ChangePasswordRequest): Promise<string> {
  return api.post<string>('/v1/auth/change-password', payload)
}

export function useChangePassword() {
  // Sem invalidação de cache: não altera dados listados no front.
  return useMutation({ mutationFn: changePassword })
}
