// Navegação por papel. Cada item aponta para uma rota real do React Router.
import type { Role } from '@/types/enums'

export interface NavItem {
  to: string
  label: string
  icon: string
}

export const NAV: Record<Role, NavItem[]> = {
  SystemAdmin: [
    { to: '/admin', label: 'Painel', icon: 'layout-dashboard' },
    { to: '/admin/orgs', label: 'Organizações', icon: 'building-2' },
    { to: '/admin/stations', label: 'Postos parceiros', icon: 'fuel' },
    { to: '/admin/users', label: 'Usuários', icon: 'users' },
  ],
  OrganizationAdmin: [
    { to: '/fleet', label: 'Painel da frota', icon: 'layout-dashboard' },
    { to: '/fleet/refuels', label: 'Abastecimentos', icon: 'receipt-text' },
    { to: '/fleet/vehicles', label: 'Frota', icon: 'truck' },
    { to: '/fleet/drivers', label: 'Motoristas', icon: 'users' },
  ],
  Driver: [
    { to: '/driver', label: 'Meus abastecimentos', icon: 'receipt-text' },
    { to: '/driver/register', label: 'Registrar abastecimento', icon: 'fuel' },
    { to: '/driver/fleet', label: 'Frota', icon: 'truck' },
  ],
  // Frentista: experiência mínima — só a home ("em desenvolvimento").
  GasStationAttendant: [{ to: '/attendant', label: 'Posto', icon: 'fuel' }],
}

// Tela inicial de cada papel após o login.
export const DEFAULT_ROUTE: Record<Role, string> = {
  SystemAdmin: '/admin',
  OrganizationAdmin: '/fleet',
  Driver: '/driver',
  GasStationAttendant: '/attendant',
}
