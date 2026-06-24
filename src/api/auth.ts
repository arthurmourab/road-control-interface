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
