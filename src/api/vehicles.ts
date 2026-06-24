import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { PagedResult } from '@/types/api'
import type { NewVehicle, UpdateVehicle, Vehicle } from '@/types/models'

const BASE = '/v1/vehicle'

export interface VehicleListParams {
  currentPage?: number
  pageSize?: number
  organizationId?: number | null
}

export const vehicleKeys = {
  all: ['vehicles'] as const,
  list: (params: VehicleListParams) => ['vehicles', 'list', params] as const,
}

function getVehicles(params: VehicleListParams) {
  return api.get<PagedResult<Vehicle>>(BASE, { params })
}

function createVehicle(payload: NewVehicle) {
  return api.post<Vehicle>(BASE, payload)
}

function updateVehicle(id: number, payload: UpdateVehicle) {
  return api.put<Vehicle>(`${BASE}/${id}`, payload)
}

function setVehicleStatus(id: number, isActive: boolean) {
  return api.patch<Vehicle>(`${BASE}/${id}/status`, { isActive })
}

export function useVehicles(params: VehicleListParams = {}, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: vehicleKeys.list(params),
    queryFn: () => getVehicles(params),
    enabled: options?.enabled ?? true,
  })
}

export function useCreateVehicle() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createVehicle,
    onSuccess: () => qc.invalidateQueries({ queryKey: vehicleKeys.all }),
  })
}

export function useUpdateVehicle() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateVehicle }) =>
      updateVehicle(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: vehicleKeys.all }),
  })
}

export function useSetVehicleStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) =>
      setVehicleStatus(id, isActive),
    onSuccess: () => qc.invalidateQueries({ queryKey: vehicleKeys.all }),
  })
}
