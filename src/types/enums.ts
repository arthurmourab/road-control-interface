// Enums do backend são serializados como string no JSON.
// Aqui modelamos como uniões de string + mapas de rótulo em pt-BR para a UI.

export type FuelType =
  | 'Gasoline'
  | 'Ethanol'
  | 'Diesel'
  | 'Gnv'
  | 'Flex'
  | 'Other'

export const FUEL_LABELS: Record<FuelType, string> = {
  Gasoline: 'Gasolina',
  Ethanol: 'Etanol',
  Diesel: 'Diesel',
  Gnv: 'GNV',
  Flex: 'Flex',
  Other: 'Outro',
}

export const FUEL_OPTIONS = (Object.keys(FUEL_LABELS) as FuelType[]).map(
  (value) => ({ value, label: FUEL_LABELS[value] }),
)

export type VehicleType =
  | 'Car'
  | 'Motorcycle'
  | 'Truck'
  | 'Bus'
  | 'Van'
  | 'Pickup'
  | 'Tractor'
  | 'Other'

export const VEHICLE_TYPE_LABELS: Record<VehicleType, string> = {
  Car: 'Carro',
  Motorcycle: 'Moto',
  Truck: 'Caminhão',
  Bus: 'Ônibus',
  Van: 'Van',
  Pickup: 'Picape',
  Tractor: 'Trator',
  Other: 'Outro',
}

export const VEHICLE_TYPE_OPTIONS = (
  Object.keys(VEHICLE_TYPE_LABELS) as VehicleType[]
).map((value) => ({ value, label: VEHICLE_TYPE_LABELS[value] }))

// Papéis (roles) centralizados — espelham Role.Roles do backend.
export type Role =
  | 'SystemAdmin'
  | 'OrganizationAdmin'
  | 'Driver'
  | 'GasStationAttendant'
  | 'GasStationAdmin'

export const ROLE_LABELS: Record<Role, string> = {
  SystemAdmin: 'Administrador da Plataforma',
  OrganizationAdmin: 'Gestor de Frota',
  Driver: 'Motorista',
  GasStationAttendant: 'Frentista',
  GasStationAdmin: 'Gestor do posto',
}

// Mapa role-name -> RoleId (BIGINT IDENTITY do banco).
// ATENÇÃO: o backend não tem endpoint para listar papéis nem seed no repo.
// Assumimos a ordem de criação do IDENTITY(1,1). Confirmar com a tabela rc.Roles
// e ajustar aqui se necessário (mudança de 1 linha).
export const ROLE_ID: Record<Role, number> = {
  SystemAdmin: 1,
  OrganizationAdmin: 2,
  Driver: 3,
  GasStationAttendant: 4,
  GasStationAdmin: 5,
}
