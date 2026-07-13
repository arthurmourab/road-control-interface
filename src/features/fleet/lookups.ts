// Junção de dados para as telas de abastecimento. O Fueling traz apenas IDs;
// aqui resolvemos rótulos de veículo, posto e motorista.
//
// Restrições do backend respeitadas:
// - Postos: usamos GET /v1/gasstation/available (Driver/OrganizationAdmin/SystemAdmin),
//   que devolve os postos ativos que atendem a org do chamador -> motorista e gestor
//   escolhem o posto por nome num Select.
// - User só é listável por gestor/admin -> no escopo motorista não buscamos a
//   lista; o nome do próprio motorista vem da sessão.
import { useMemo } from 'react'
import { useVehicles } from '@/api/vehicles'
import { useUsers } from '@/api/users'
import { useAvailableGasStations } from '@/api/gasStations'
import type { GasStation, User, Vehicle } from '@/types/models'

export type RefuelScope = 'fleet' | 'driver'

export interface FleetLookups {
  vehicles: Vehicle[]
  drivers: User[]
  stations: GasStation[]
  // Erro ao carregar os postos disponíveis (para feedback na tela, se preciso).
  stationsError: boolean
  vehicleById: (id: number) => Vehicle | undefined
  vehicleLabel: (id: number) => string
  driverName: (id: number) => string
  stationName: (id: number) => string
  isLoading: boolean
}

export function useFleetLookups(scope: RefuelScope, selfUser?: User | null): FleetLookups {
  const vehiclesQ = useVehicles({ pageSize: 1000 })
  const usersQ = useUsers({ pageSize: 1000 }, { enabled: scope === 'fleet' })
  // /available devolve uma lista simples (não paginada) dos postos que atendem
  // a org do chamador — disponível a Driver/OrganizationAdmin/SystemAdmin.
  const stationsQ = useAvailableGasStations()

  return useMemo(() => {
    const vehicles = vehiclesQ.data?.results ?? []
    const drivers = (usersQ.data?.results ?? []).filter((u) => u.role === 'Driver')
    const stations = stationsQ.data ?? []
    const stationsError = stationsQ.isError

    const vMap = new Map(vehicles.map((v) => [v.id, v]))
    const uMap = new Map((usersQ.data?.results ?? []).map((u) => [u.id, u]))
    if (selfUser) uMap.set(selfUser.id, selfUser)
    const sMap = new Map(stations.map((s) => [s.id, s]))

    return {
      vehicles,
      drivers,
      stations,
      stationsError,
      vehicleById: (id) => vMap.get(id),
      vehicleLabel: (id) => {
        const v = vMap.get(id)
        return v ? `${v.plate} — ${v.brand} ${v.model}` : `Veículo #${id}`
      },
      driverName: (id) => {
        const u = uMap.get(id)
        return u ? `${u.name} ${u.lastName}` : `Motorista #${id}`
      },
      stationName: (id) => {
        const s = sMap.get(id)
        return s ? s.name : `Posto #${id}`
      },
      isLoading: vehiclesQ.isLoading || (scope === 'fleet' && usersQ.isLoading),
    }
  }, [vehiclesQ.data, vehiclesQ.isLoading, usersQ.data, usersQ.isLoading, stationsQ.data, stationsQ.isError, scope, selfUser])
}
