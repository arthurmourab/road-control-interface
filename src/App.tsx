// Roteamento da aplicação, com guarda de autenticação e autorização por papel.
import { Navigate, Route, Routes } from 'react-router-dom'
import { LoginPage } from '@/features/auth/LoginPage'
import { ProfilePage } from '@/features/auth/ProfilePage'
import { AppLayout } from '@/components/shell/AppLayout'
import { HomeRedirect, RequireAuth, RequireRole } from '@/components/shell/guards'
import { AdminDashboard } from '@/features/admin/AdminDashboard'
import { OrgsList } from '@/features/admin/OrgsList'
import { StationsList } from '@/features/admin/StationsList'
import { PlatformUsers } from '@/features/admin/PlatformUsers'
import { FleetDashboard } from '@/features/fleet/FleetDashboard'
import { RefuelsList } from '@/features/fleet/RefuelsList'
import { RegisterRefuel } from '@/features/fleet/RegisterRefuel'
import { VehiclesList } from '@/features/fleet/VehiclesList'
import { DriversList } from '@/features/fleet/DriversList'
import { MyRefuels, DriverRegister, DriverFleet } from '@/features/driver'
import { AttendantHome } from '@/features/attendant/AttendantHome'
import { StationDashboard } from '@/features/station/StationDashboard'
import { StationTeam } from '@/features/station/StationTeam'

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<RequireAuth />}>
        <Route element={<AppLayout />}>
          <Route index element={<HomeRedirect />} />

          {/* Perfil: qualquer papel logado; acesso pelo Topbar (sem item de navegação) */}
          <Route path="profile" element={<ProfilePage />} />

          {/* Administrador da plataforma */}
          <Route element={<RequireRole roles={['SystemAdmin']} />}>
            <Route path="admin" element={<AdminDashboard />} />
            <Route path="admin/orgs" element={<OrgsList />} />
            <Route path="admin/stations" element={<StationsList />} />
            <Route path="admin/users" element={<PlatformUsers />} />
          </Route>

          {/* Gestor de frota */}
          <Route element={<RequireRole roles={['OrganizationAdmin']} />}>
            <Route path="fleet" element={<FleetDashboard />} />
            <Route path="fleet/refuels" element={<RefuelsList />} />
            <Route path="fleet/register" element={<RegisterRefuel />} />
            <Route path="fleet/vehicles" element={<VehiclesList />} />
            <Route path="fleet/drivers" element={<DriversList />} />
          </Route>

          {/* Motorista */}
          <Route element={<RequireRole roles={['Driver']} />}>
            <Route path="driver" element={<MyRefuels />} />
            <Route path="driver/register" element={<DriverRegister />} />
            <Route path="driver/fleet" element={<DriverFleet />} />
          </Route>

          {/* Frentista: home mínima enquanto as funcionalidades não existem */}
          <Route element={<RequireRole roles={['GasStationAttendant']} />}>
            <Route path="attendant" element={<AttendantHome />} />
          </Route>

          {/* Gestor do posto */}
          <Route element={<RequireRole roles={['GasStationAdmin']} />}>
            <Route path="station" element={<StationDashboard />} />
            <Route path="station/team" element={<StationTeam />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
