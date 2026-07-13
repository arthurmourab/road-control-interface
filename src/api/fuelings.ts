import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { PagedResult } from '@/types/api'
import type { ConfirmationCode, Fueling, NewFueling } from '@/types/models'

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
  confirmationCode: ['fuelings', 'confirmation-code'] as const,
}

function getConfirmationCode() {
  return api.get<ConfirmationCode>(`${BASE}/confirmation-code`)
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

// Código de confirmação do frentista. O backend renova a cada 60s; refazemos o
// GET quando o código expira usando refetchInterval derivado de secondsRemaining
// (com piso de segurança para não martelar o backend em caso de resposta estranha).
export function useConfirmationCode(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: fuelingKeys.confirmationCode,
    queryFn: getConfirmationCode,
    enabled: options?.enabled ?? true,
    retry: false,
    // Sem cache reaproveitável entre montagens — o código é efêmero.
    gcTime: 0,
    staleTime: 0,
    refetchInterval: (query) => {
      const secs = query.state.data?.secondsRemaining
      if (secs === undefined) return 60_000
      // Renova logo após expirar; mínimo de 5s para não entrar em loop apertado.
      return Math.max(secs, 5) * 1000
    },
    refetchIntervalInBackground: true,
  })
}

export function useCreateFueling() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createFueling,
    onSuccess: () => qc.invalidateQueries({ queryKey: fuelingKeys.all }),
  })
}
