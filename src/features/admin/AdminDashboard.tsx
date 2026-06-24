// Painel da plataforma (admin): visão geral agregada do RoadControl.
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Badge, Button, Card, Icon, StatCard } from '@/components/ds'
import { DataTable, LoadingState, PageHeader, StatusBadge, type Column } from '@/components/ui'
import { useOrganizations } from '@/api/organizations'
import { useGasStations } from '@/api/gasStations'
import { useVehicles } from '@/api/vehicles'
import { useFuelings } from '@/api/fuelings'
import { useUsers } from '@/api/users'
import { VBarChart, type SeriesPoint } from '@/features/fleet/charts'
import type { Organization } from '@/types/models'
import { dateBR, formatCnpj, intBR } from '@/lib/format'

const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

export function AdminDashboard() {
  const navigate = useNavigate()
  const orgsQ = useOrganizations({ pageSize: 1000 })
  const stationsQ = useGasStations({ pageSize: 1000 })
  const vehiclesQ = useVehicles({ pageSize: 1000 })
  const fuelingsQ = useFuelings({ pageSize: 1000 })
  const usersQ = useUsers({ pageSize: 1000 })

  const orgs = useMemo(() => orgsQ.data?.results ?? [], [orgsQ.data])
  const stations = stationsQ.data?.results ?? []
  const fuelings = useMemo(() => fuelingsQ.data?.results ?? [], [fuelingsQ.data])
  const users = usersQ.data?.results ?? []

  const activeOrgs = orgs.filter((o) => o.isActive).length
  const globalStations = stations.filter((s) => s.isGlobal).length
  const linkedStations = stations.filter((s) => !s.isGlobal).length
  const activeUsers = users.filter((u) => u.isActive).length

  // Série dos últimos 6 meses (nº de abastecimentos por mês).
  const series: SeriesPoint[] = useMemo(() => {
    const out: SeriesPoint[] = []
    const today = new Date()
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1)
      const next = new Date(d.getFullYear(), d.getMonth() + 1, 1)
      const value = fuelings.filter((r) => {
        const t = new Date(r.fueledAt)
        return t >= d && t < next
      }).length
      out.push({ label: MONTHS[d.getMonth()], value })
    }
    return out
  }, [fuelings])

  const thisMonthCount = series.length ? series[series.length - 1].value : 0

  const recent = useMemo(
    () => [...orgs].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)).slice(0, 5),
    [orgs],
  )

  const orgColumns: Column<Organization>[] = [
    {
      key: 'name',
      header: 'Organização',
      render: (o) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
          <span style={{ display: 'grid', placeItems: 'center', width: 34, height: 34, borderRadius: 8, background: 'var(--surface-sunken)', flex: 'none' }}>
            <Icon name="building-2" size={17} color="var(--text-secondary)" />
          </span>
          <span style={{ fontSize: 14, fontWeight: 500 }}>{o.name}</span>
        </div>
      ),
    },
    { key: 'cnpj', header: 'CNPJ', nowrap: true, render: (o) => <span style={{ fontFamily: 'var(--font-number)', fontSize: 13.5, color: 'var(--text-secondary)' }}>{formatCnpj(o.document)}</span> },
    { key: 'status', header: 'Status', render: (o) => <StatusBadge active={o.isActive} /> },
    { key: 'created', header: 'Cadastro', align: 'right', nowrap: true, render: (o) => <span style={{ fontFamily: 'var(--font-number)', fontSize: 13.5, color: 'var(--text-secondary)' }}>{dateBR(o.createdAt)}</span> },
  ]

  const loading = orgsQ.isLoading || stationsQ.isLoading || vehiclesQ.isLoading

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      <PageHeader title="Painel da plataforma" subtitle="Visão geral do RoadControl" />

      {loading ? (
        <Card><LoadingState /></Card>
      ) : (
        <>
          <div className="rc-stat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            <StatCard label="Organizações ativas" value={String(activeOrgs)} unit={`/ ${orgs.length}`} accent icon={<Icon name="building-2" size={17} color="var(--amber-700)" />} />
            <StatCard label="Postos parceiros" value={String(stationsQ.data?.totalRows ?? stations.length)} icon={<Icon name="fuel" size={17} color="var(--text-secondary)" />} />
            <StatCard label="Veículos na plataforma" value={intBR(vehiclesQ.data?.totalRows ?? 0)} icon={<Icon name="truck" size={17} color="var(--text-secondary)" />} />
            <StatCard label="Abastecimentos no mês" value={intBR(thisMonthCount)} icon={<Icon name="receipt-text" size={17} color="var(--text-secondary)" />} />
          </div>

          <div className="rc-2col" style={{ display: 'grid', gridTemplateColumns: '1.55fr 1fr', gap: 16 }}>
            <Card>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                <div>
                  <h2 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 600 }}>Abastecimentos por mês</h2>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>Plataforma · últimos 6 meses</div>
                </div>
                <Badge tone="neutral">Agregado</Badge>
              </div>
              <VBarChart series={series} />
            </Card>
            <Card>
              <h2 style={{ margin: '0 0 8px', fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 600 }}>Distribuição</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 10 }}>
                <DistRow icon="building-2" label="Organizações" value={String(orgs.length)} />
                <DistRow icon="fuel" label="Postos globais" value={String(globalStations)} />
                <DistRow icon="link" label="Postos vinculados" value={String(linkedStations)} />
                <DistRow icon="users" label="Usuários ativos" value={String(activeUsers)} />
              </div>
            </Card>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <h2 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 600 }}>Organizações recentes</h2>
              <Button variant="ghost" size="sm" iconRight={<Icon name="arrow-right" size={16} color="var(--text-strong)" />} onClick={() => navigate('/admin/orgs')}>
                Ver todas
              </Button>
            </div>
            <DataTable
              columns={orgColumns}
              rows={recent}
              rowKey={(o) => o.id}
              state={recent.length === 0 ? 'empty' : 'normal'}
              emptyProps={{ icon: 'building-2', title: 'Nenhuma organização', body: 'Cadastre a primeira organização cliente da plataforma.' }}
            />
          </div>
        </>
      )}
    </div>
  )
}

function DistRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <span style={{ display: 'grid', placeItems: 'center', width: 36, height: 36, borderRadius: 9, background: 'var(--surface-sunken)', flex: 'none' }}>
        <Icon name={icon} size={18} color="var(--text-secondary)" />
      </span>
      <span style={{ flex: 1, fontSize: 14, color: 'var(--text-primary)' }}>{label}</span>
      <span style={{ fontFamily: 'var(--font-number)', fontSize: 17, fontWeight: 600, color: 'var(--text-primary)' }}>{value}</span>
    </div>
  )
}
