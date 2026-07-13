// Tipos de domínio espelhando os DTOs do backend (RC.Shared/Dtos).
import type { FuelType, VehicleType, Role } from './enums'

// ---- Autenticação ----
export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
  expiresAt: string
  name: string
  lastName: string
  role: Role
}

// ---- Usuário (UserDto / NewUserDto) ----
export interface User {
  id: number
  createdAt: string
  updatedAt: string | null
  name: string
  lastName: string
  email: string
  isActive: boolean
  role: Role
  organizationId: number | null
  organizationName: string | null
  gasStationId: number | null
  gasStationName: string | null
}

export interface NewUser {
  name: string
  lastName: string
  email: string
  password: string
  roleId: number
  // Vínculos: org para gestor de frota/motorista; posto para gestor do posto/
  // frentista; nunca os dois. GasStationAdmin criando pode omitir gasStationId
  // (o backend assume o posto do chamador).
  organizationId?: number | null
  gasStationId?: number | null
}

// ---- Organização ----
export interface Organization {
  id: number
  createdAt: string
  updatedAt: string | null
  name: string
  document: string
  isActive: boolean
}

export interface NewOrganization {
  name: string
  document: string
}

// ---- Posto parceiro (GasStation) ----
export interface GasStation {
  id: number
  createdAt: string
  updatedAt: string | null
  name: string
  document: string
  isGlobal: boolean
  isActive: boolean
  street: string
  number: string
  neighborhood: string
  city: string
  state: string
  zipCode: string
  organizationIds: number[]
}

export interface NewGasStation {
  name: string
  document: string
  isGlobal: boolean
  street: string
  number: string
  neighborhood: string
  city: string
  state: string
  zipCode: string
}

export interface UpdateGasStation {
  name: string
  isGlobal: boolean
  isActive: boolean
  street: string
  number: string
  neighborhood: string
  city: string
  state: string
  zipCode: string
}

// ---- Veículo ----
export interface Vehicle {
  id: number
  createdAt: string
  updatedAt: string | null
  type: VehicleType
  plate: string
  brand: string
  model: string
  yearManufacture: number
  yearModel: number
  mileage: number
  isActive: boolean | null
  organizationId: number
}

export interface NewVehicle {
  type: VehicleType
  plate: string
  brand: string
  model: string
  yearManufacture: number
  yearModel: number
  mileage: number
  organizationId: number
}

export interface UpdateVehicle {
  type: VehicleType
  plate: string
  brand: string
  model: string
  yearManufacture: number
  yearModel: number
  mileage: number
}

// ---- Abastecimento (Fueling) ----
export interface Fueling {
  id: number
  createdAt: string
  updatedAt: string | null
  vehicleId: number
  gasStationId: number
  driverId: number
  organizationId: number
  fuelType: FuelType
  liters: number
  pricePerLiter: number
  totalAmount: number
  mileage: number
  fueledAt: string
  attendantId: number | null
}

export interface NewFueling {
  vehicleId: number
  gasStationId: number
  driverId?: number | null
  fuelType: FuelType
  liters: number
  pricePerLiter: number
  mileage: number
  fueledAt: string
  // Código de 6 dígitos gerado pelo frentista (obrigatório no backend).
  confirmationCode: string
}

// ---- Código de confirmação de abastecimento (só GasStationAttendant) ----
export interface ConfirmationCode {
  code: string
  expiresAt: string
  secondsRemaining: number
}
