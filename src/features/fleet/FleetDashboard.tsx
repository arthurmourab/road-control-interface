// Painel da frota (gestor): KPIs, gastos por período e por veículo, recentes.
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Badge, Button, Card, Icon, StatCard } from '@/components/ds'
import { DataTable, LoadingState, PageHeader, Plate, type Column } from '@/components/ui'
import { useFuelings } from '@/api/fuelings'
import { useVehicles } from '@/api/vehicles'
import { useFleetLookups } from './lookups'
import { useAuth } from '@/lib/auth'
import { AreaChart, SpendBars, type SeriesPoint, type SpendBar } from './charts'
import type { Fueling } from '@/types/models'
import { brl, dateTimeBR, intBR, liters as fmtLiters } from '@/lib/format'

export function FleetDashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const fuelingsQ = useFuelings({ pageSize: 1000 })
  const vehiclesQ = useVehicles({ pageSize: 1000 })
  const lookups = useFleetLookups('fleet', user)

  const fuelings = useMemo(() => fuelingsQ.data?.results ?? [], [fuelingsQ.data])
  const vehicles = vehiclesQ.data?.results ?? []

  const totalValue = fuelings.reduce((s, r) => s + r.totalAmount, 0)
  const totalLiters = fuelings.reduce((s, r) => s + r.liters, 0)
  const activeVehicles = vehicles.filter((v) => v.isActive !== false).length

  // Série dos últimos 7 dias (gasto por dia).
  const series: SeriesPoint[] = useMemo(() => {
    const days: SeriesPoint[] = []
    const today = new Date()
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today)
      d.setHours(0, 0, 0, 0)
      d.setDate(d.getDate() - i)
      const next = new Date(d)
      next.setDate(d.getDate() + 1)
      const value = fuelings
        .filter((r) => {
          const t = new Date(r.fueledAt)
          return t >= d && t < next
        })
        .reduce((s, r) => s + r.totalAmount, 0)
      days.push({ label: `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`, value })
    }
    return days
  }, [fuelings])

  // Top 6 veículos por gasto.
  const spendBars: SpendBar[] = useMemo(() => {
    const byVehicle = new Map<number, number>()
    fuelings.forEach((r) => byVehicle.set(r.vehicleId, (byVehicle.get(r.vehicleId) ?? 0) + r.totalAmount))
    return [...byVehicle.entries()]
      .map(([id, value]) => ({ id: String(id), value, label: lookups.vehicleById(id)?.plate ?? `#${id}` }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6)
  }, [fuelings, lookups])

  const recent = useMemo(
    () => [...fuelings].sort((a, b) => +new Date(b.fueledAt) - +new Date(a.fueledAt)).slice(0, 6),
    [fuelings],
  )

  const recentColumns: Column<Fueling>[] = [
    {
      key: 'when',
      header: 'Data / hora',
      nowrap: true,
      render: (r) => <span style={{ fontFamily: 'var(--font-number)', fontSize: 13.5, color: 'var(--text-secondary)' }}>{dateTimeBR(r.fueledAt)}</span>,
    },
    {
      key: 'vehicle',
      header: 'Veículo',
      render: (r) => {
        const v = lookups.vehicleById(r.vehicleId)
        return (
          <div>
            <Plate>{v?.plate ?? `#${r.vehicleId}`}</Plate>
            {v && <div style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>{v.brand} {v.model}</div>}
          </div>
        )
      },
    },
    { key: 'driver', header: 'Motorista', render: (r) => <span style={{ fontSize: 14 }}>{lookups.driverName(r.driverId)}</span> },
    { key: 'station', header: 'Posto', render: (r) => <span style={{ fontSize: 14 }}>{lookups.stationName(r.gasStationId)}</span> },
    { key: 'liters', header: 'Litros', align: 'right', nowrap: true, render: (r) => <span style={{ fontFamily: 'var(--font-number)', fontSize: 14, fontWeight: 500 }}>{fmtLiters(r.liters)}</span> },
    { key: 'value', header: 'Total', align: 'right', nowrap: true, render: (r) => <span style={{ fontFamily: 'var(--font-number)', fontSize: 14.5, fontWeight: 600 }}>{brl(r.totalAmount)}</span> },
  ]

  if (fuelingsQ.isLoading || vehiclesQ.isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
        <PageHeader title="Painel da frota" subtitle="Sua frota, na linha." />
        <Card><LoadingState /></Card>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      <PageHeader
        title="Painel da frota"
        subtitle="Sua frota, na linha."
        actions={
          <Button variant="primary" iconLeft={<Icon name="plus" size={18} color="var(--ink-navy)" />} onClick={() => navigate('/fleet/register')}>
            Registrar abastecimento
          </Button>
        }
      />

      <div className="rc-stat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        <StatCard label="Gasto total" value={brl(totalValue)} accent icon={<Icon name="wallet" size={17} color="var(--amber-700)" />} />
        <StatCard label="Litros" value={intBR(totalLiters)} unit="L" icon={<Icon name="fuel" size={17} color="var(--text-secondary)" />} />
        <StatCard label="Abastecimentos" value={intBR(fuelingsQ.data?.totalRows ?? fuelings.length)} icon={<Icon name="receipt-text" size={17} color="var(--text-secondary)" />} />
        <StatCard label="Veículos ativos" value={String(activeVehicles)} unit={`/ ${vehicles.length}`} icon={<Icon name="truck" size={17} color="var(--text-secondary)" />} />
      </div>

      <div className="rc-2col" style={{ display: 'grid', gridTemplateColumns: '1.55fr 1fr', gap: 16 }}>
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <div>
              <h2 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 600 }}>Gastos por período</h2>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>Últimos 7 dias</div>
            </div>
            <Badge tone="neutral">{brl(totalValue)}</Badge>
          </div>
          <AreaChart series={series} />
        </Card>
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <h2 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 600 }}>Gastos por veículo</h2>
            <Badge tone="neutral">Top 6</Badge>
          </div>
          {spendBars.length > 0 ? (
            <SpendBars rows={spendBars} />
          ) : (
            <div style={{ fontSize: 14, color: 'var(--text-secondary)', padding: '20px 0' }}>Sem dados ainda.</div>
          )}
        </Card>
      </div>

      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <h2 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 600 }}>Abastecimentos recentes</h2>
          <Button variant="ghost" size="sm" iconRight={<Icon name="arrow-right" size={16} color="var(--text-strong)" />} onClick={() => navigate('/fleet/refuels')}>
            Ver todos
          </Button>
        </div>
        <DataTable
          columns={recentColumns}
          rows={recent}
          rowKey={(r) => r.id}
          state={recent.length === 0 ? 'empty' : 'normal'}
          emptyProps={{ icon: 'receipt-text', title: 'Nenhum abastecimento ainda', body: 'Os registros aparecem aqui assim que os motoristas começam a abastecer.' }}
        />
      </div>
    </div>
  )
}
