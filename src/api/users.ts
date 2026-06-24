import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { PagedResult } from '@/types/api'
import type { NewUser, User } from '@/types/models'

const BASE = '/v1/user'

export interface UserListParams {
  currentPage?: number
  pageSize?: number
  // SystemAdmin pode filtrar por organização; demais papéis são restringidos
  // pelo próprio token no backend.
  organizationId?: number | null
}

export const userKeys = {
  all: ['users'] as const,
  list: (params: UserListParams) => ['users', 'list', params] as const,
}

function getUsers(params: UserListParams) {
  return api.get<PagedResult<User>>(BASE, { params })
}

function createUser(payload: NewUser) {
  return api.post<User>(BASE, payload)
}

function setUserStatus(id: number, isActive: boolean) {
  return api.patch<User>(`${BASE}/${id}/status`, { isActive })
}

export function useUsers(params: UserListParams = {}, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: () => getUsers(params),
    enabled: options?.enabled ?? true,
  })
}

export function useCreateUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createUser,
    onSuccess: () => qc.invalidateQueries({ queryKey: userKeys.all }),
  })
}

export function useSetUserStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) =>
      setUserStatus(id, isActive),
    onSuccess: () => qc.invalidateQueries({ queryKey: userKeys.all }),
  })
}
