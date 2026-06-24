import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { PagedResult } from '@/types/api'
import type { NewOrganization, Organization } from '@/types/models'

const BASE = '/v1/organization'

export interface OrgListParams {
  currentPage?: number
  pageSize?: number
}

export const organizationKeys = {
  all: ['organizations'] as const,
  list: (params: OrgListParams) => ['organizations', 'list', params] as const,
  detail: (id: number) => ['organizations', 'detail', id] as const,
}

function getOrganizations(params: OrgListParams) {
  return api.get<PagedResult<Organization>>(BASE, { params })
}

function getOrganization(id: number) {
  return api.get<Organization>(`${BASE}/${id}`)
}

function createOrganization(payload: NewOrganization) {
  return api.post<Organization>(BASE, payload)
}

export function useOrganizations(params: OrgListParams = {}, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: organizationKeys.list(params),
    queryFn: () => getOrganizations(params),
    enabled: options?.enabled ?? true,
  })
}

export function useOrganization(id: number | null) {
  return useQuery({
    queryKey: organizationKeys.detail(id ?? 0),
    queryFn: () => getOrganization(id as number),
    enabled: id != null,
  })
}

export function useCreateOrganization() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createOrganization,
    onSuccess: () => qc.invalidateQueries({ queryKey: organizationKeys.all }),
  })
}
