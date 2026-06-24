import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { PagedResult } from '@/types/api'
import type {
  GasStation,
  NewGasStation,
  UpdateGasStation,
} from '@/types/models'

const BASE = '/v1/gasstation'

export interface GasStationListParams {
  currentPage?: number
  pageSize?: number
}

export const gasStationKeys = {
  all: ['gasStations'] as const,
  list: (params: GasStationListParams) =>
    ['gasStations', 'list', params] as const,
  detail: (id: number) => ['gasStations', 'detail', id] as const,
}

function getGasStations(params: GasStationListParams) {
  return api.get<PagedResult<GasStation>>(BASE, { params })
}

function createGasStation(payload: NewGasStation) {
  return api.post<GasStation>(BASE, payload)
}

function updateGasStation(id: number, payload: UpdateGasStation) {
  return api.put<GasStation>(`${BASE}/${id}`, payload)
}

function linkOrganizations(id: number, organizationIds: number[]) {
  return api.post<GasStation>(`${BASE}/${id}/organizations`, {
    organizationIds,
  })
}

function unlinkOrganization(id: number, organizationId: number) {
  return api.delete<GasStation>(`${BASE}/${id}/organizations/${organizationId}`)
}

export function useGasStations(
  params: GasStationListParams = {},
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: gasStationKeys.list(params),
    queryFn: () => getGasStations(params),
    enabled: options?.enabled ?? true,
    retry: false,
  })
}

export function useCreateGasStation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createGasStation,
    onSuccess: () => qc.invalidateQueries({ queryKey: gasStationKeys.all }),
  })
}

export function useUpdateGasStation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateGasStation }) =>
      updateGasStation(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: gasStationKeys.all }),
  })
}

export function useLinkOrganizations() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      organizationIds,
    }: {
      id: number
      organizationIds: number[]
    }) => linkOrganizations(id, organizationIds),
    onSuccess: () => qc.invalidateQueries({ queryKey: gasStationKeys.all }),
  })
}

export function useUnlinkOrganization() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      organizationId,
    }: {
      id: number
      organizationId: number
    }) => unlinkOrganization(id, organizationId),
    onSuccess: () => qc.invalidateQueries({ queryKey: gasStationKeys.all }),
  })
}
