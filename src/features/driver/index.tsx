// Telas do motorista — reaproveitam os componentes da frota em escopo "driver":
// dados restritos ao próprio motorista (o backend já filtra pelo token).
import { RefuelsList } from '@/features/fleet/RefuelsList'
import { RegisterRefuel } from '@/features/fleet/RegisterRefuel'
import { VehiclesList } from '@/features/fleet/VehiclesList'

export function MyRefuels() {
  return <RefuelsList scope="driver" />
}

export function DriverRegister() {
  return <RegisterRefuel scope="driver" />
}

export function DriverFleet() {
  return <VehiclesList scope="driver" />
}
