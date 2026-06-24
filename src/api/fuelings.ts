import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { PagedResult } from '@/types/api'
import type { Fueling, NewFueling } from '@/types/models'

const BASE = '/v1/fueling'

export interface FuelingListParams {
  currentPage?: number
  pageSize?: number
  organizationId?: number | null
  vehicleId?: number | null
  // Datas em ISO (yyyy-mm-dd ou completo) para o período do abastecimento.
  from?: string | null
  to?: string | null
}

export const fuelingKeys = {
  all: ['fuelings'] as const,
  list: (params: FuelingListParams) => ['fuelings', 'list', params] as const,
}

// Remove chaves nulas/vazias para não enviar query params desnecessários.
function clean(params: FuelingListParams): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(params)) {
    if (value !== null && value !== undefined && value !== '') out[key] = value
  }
  return out
}

function getFuelings(params: FuelingListParams) {
  return api.get<PagedResult<Fueling>>(BASE, { params: clean(params) })
}

function createFueling(payload: NewFueling) {
  return api.post<Fueling>(BASE, payload)
}

export function useFuelings(params: FuelingListParams = {}, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: fuelingKeys.list(params),
    queryFn: () => getFuelings(params),
    enabled: options?.enabled ?? true,
  })
}

export function useCreateFueling() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createFueling,
    onSuccess: () => qc.invalidateQueries({ queryKey: fuelingKeys.all }),
  })
}
