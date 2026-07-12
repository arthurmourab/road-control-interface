// Home do Gestor do posto. O único dado disponível a este papel hoje é a
// própria equipe (GET /v1/user já vem filtrado pelo posto do chamador no
// backend), então o painel resume a equipe e aponta para a gestão dela.
import { Link } from 'react-router-dom'
import { Button, Icon, StatCard } from '@/components/ds'
import { ErrorState, LoadingState, PageHeader } from '@/components/ui'
import { useUsers } from '@/api/users'

export function StationDashboard() {
  const query = useUsers({ pageSize: 1000 })
  const team = query.data?.results ?? []
  const attendants = team.filter((u) => u.role === 'GasStationAttendant')
  const admins = team.filter((u) => u.role === 'GasStationAdmin')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <PageHeader
        title="Painel do posto"
        subtitle="Visão geral da equipe do seu posto"
        actions={
          <Link to="/station/team" style={{ textDecoration: 'none' }}>
            <Button variant="primary" iconLeft={<Icon name="users" size={18} color="var(--ink-navy)" />}>
              Gerenciar equipe
            </Button>
          </Link>
        }
      />

      {query.isLoading ? (
        <LoadingState />
      ) : query.isError ? (
        <ErrorState onRetry={() => query.refetch()} />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          <StatCard
            label="Equipe"
            value={team.length}
            unit="pessoas"
            icon={<Icon name="users" size={20} color="var(--text-muted)" />}
          />
          <StatCard
            label="Frentistas ativos"
            value={attendants.filter((u) => u.isActive).length}
            unit={`de ${attendants.length}`}
            icon={<Icon name="fuel" size={20} color="var(--text-muted)" />}
          />
          <StatCard
            label="Gestores do posto"
            value={admins.length}
            icon={<Icon name="shield" size={20} color="var(--text-muted)" />}
          />
        </div>
      )}
    </div>
  )
}
