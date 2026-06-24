// Lista de abastecimentos (gestor) / "Meus abastecimentos" (motorista).
// Paginação e filtros (veículo, período) no servidor.
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Card, Icon, Input, Select, Tag } from '@/components/ds'
import {
  DataTable,
  Modal,
  PageHeader,
  Plate,
  DetailGrid,
  Field,
  type Column,
} from '@/components/ui'
import { useFuelings } from '@/api/fuelings'
import { useFleetLookups, type RefuelScope } from './lookups'
import { useAuth } from '@/lib/auth'
import { FUEL_LABELS, VEHICLE_TYPE_LABELS } from '@/types/enums'
import type { Fueling } from '@/types/models'
import { brl, dateTimeBR, km, liters, pricePerL } from '@/lib/format'
import { tableState } from '@/lib/tableState'

const PAGE = 8

export function RefuelsList({ scope = 'fleet' }: { scope?: RefuelScope }) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [page, setPage] = useState(1)
  const [vehicleId, setVehicleId] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [detail, setDetail] = useState<Fueling | null>(null)

  const lookups = useFleetLookups(scope, user)
  const query = useFuelings({
    currentPage: page,
    pageSize: PAGE,
    vehicleId: vehicleId ? Number(vehicleId) : null,
    from: from || null,
    to: to ? `${to}T23:59:59` : null,
  })

  const rows = query.data?.results ?? []
  const total = query.data?.totalRows ?? 0
  const hasFilter = Boolean(vehicleId || from || to)
  const state = tableState({
    isLoading: query.isLoading,
    isError: query.isError,
    isEmpty: rows.length === 0,
  })

  const vehicleOpts = [
    { value: '', label: 'Todos os veículos' },
    ...lookups.vehicles.map((v) => ({ value: String(v.id), label: `${v.plate} — ${v.brand} ${v.model}` })),
  ]

  const columns: Column<Fueling>[] = [
    {
      key: 'when',
      header: 'Data / hora',
      nowrap: true,
      render: (r) => (
        <span style={{ fontFamily: 'var(--font-number)', fontSize: 13.5, color: 'var(--text-secondary)' }}>
          {dateTimeBR(r.fueledAt)}
        </span>
      ),
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
    { key: 'fuel', header: 'Combustível', render: (r) => <Tag>{FUEL_LABELS[r.fuelType]}</Tag> },
    {
      key: 'liters',
      header: 'Litros',
      align: 'right',
      nowrap: true,
      render: (r) => <span style={{ fontFamily: 'var(--font-number)', fontSize: 14, fontWeight: 500 }}>{liters(r.liters)}</span>,
    },
    {
      key: 'ppl',
      header: 'Preço/litro',
      align: 'right',
      nowrap: true,
      render: (r) => (
        <span style={{ fontFamily: 'var(--font-number)', fontSize: 13.5, color: 'var(--text-secondary)' }}>
          {pricePerL(r.pricePerLiter)}
        </span>
      ),
    },
    {
      key: 'value',
      header: 'Total',
      align: 'right',
      nowrap: true,
      render: (r) => <span style={{ fontFamily: 'var(--font-number)', fontSize: 14.5, fontWeight: 600 }}>{brl(r.totalAmount)}</span>,
    },
  ]

  const title = scope === 'driver' ? 'Meus abastecimentos' : 'Abastecimentos'
  const subtitle =
    scope === 'driver' ? 'Abastecimentos que você registrou' : 'Registros enviados pelos motoristas da frota'
  const registerRoute = scope === 'driver' ? '/driver/register' : '/fleet/register'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <PageHeader
        title={title}
        subtitle={subtitle}
        actions={
          <Button
            variant="primary"
            iconLeft={<Icon name="plus" size={18} color="var(--ink-navy)" />}
            onClick={() => navigate(registerRoute)}
          >
            Registrar abastecimento
          </Button>
        }
      />

      <Card style={{ display: 'flex', alignItems: 'flex-end', gap: 14, flexWrap: 'wrap' }}>
        <Select
          label="Veículo"
          options={vehicleOpts}
          value={vehicleId}
          onChange={(e) => {
            setVehicleId(e.target.value)
            setPage(1)
          }}
          style={{ width: 260 }}
        />
        <Input
          label="Data inicial"
          type="date"
          value={from}
          onChange={(e) => {
            setFrom(e.target.value)
            setPage(1)
          }}
          style={{ width: 170 }}
        />
        <Input
          label="Data final"
          type="date"
          value={to}
          onChange={(e) => {
            setTo(e.target.value)
            setPage(1)
          }}
          style={{ width: 170 }}
        />
        {hasFilter && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setVehicleId('')
              setFrom('')
              setTo('')
              setPage(1)
            }}
            iconLeft={<Icon name="x" size={15} color="var(--text-strong)" />}
          >
            Limpar filtros
          </Button>
        )}
      </Card>

      <DataTable
        columns={columns}
        rows={rows}
        state={state}
        page={page}
        pageSize={PAGE}
        total={total}
        onPage={setPage}
        onRowClick={(r) => setDetail(r)}
        onRetry={() => query.refetch()}
        rowKey={(r) => r.id}
        emptyProps={{
          icon: 'receipt-text',
          title: hasFilter ? 'Nenhum abastecimento no filtro' : 'Nenhum abastecimento ainda',
          body: hasFilter
            ? 'Ajuste os filtros para ver outros registros.'
            : 'Eles aparecem aqui assim que o motorista registra o primeiro abastecimento.',
        }}
      />

      <RefuelDetailModal refuel={detail} lookups={lookups} onClose={() => setDetail(null)} />
    </div>
  )
}

function RefuelDetailModal({
  refuel,
  lookups,
  onClose,
}: {
  refuel: Fueling | null
  lookups: ReturnType<typeof useFleetLookups>
  onClose: () => void
}) {
  if (!refuel) return null
  const v = lookups.vehicleById(refuel.vehicleId)
  return (
    <Modal
      open={!!refuel}
      onClose={onClose}
      width={560}
      title="Detalhe do abastecimento"
      subtitle={dateTimeBR(refuel.fueledAt)}
      footer={<Button variant="outline" onClick={onClose}>Fechar</Button>}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          padding: '16px 18px',
          background: 'var(--surface-sunken)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-subtle)',
          marginBottom: 22,
        }}
      >
        <span
          style={{
            display: 'grid',
            placeItems: 'center',
            width: 44,
            height: 44,
            borderRadius: 10,
            background: 'var(--ink-navy)',
            flex: 'none',
          }}
        >
          <Icon name="fuel" size={22} color="var(--signal-amber)" />
        </span>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'var(--font-number)', fontWeight: 600, fontSize: 16 }}>
            {v ? `${v.plate} · ${v.brand} ${v.model}` : `Veículo #${refuel.vehicleId}`}
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            {lookups.stationName(refuel.gasStationId)}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: 'var(--font-number)', fontWeight: 600, fontSize: 22, color: 'var(--text-primary)' }}>
            {brl(refuel.totalAmount)}
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>total</div>
        </div>
      </div>
      <DetailGrid cols={2}>
        <Field label="Motorista">{lookups.driverName(refuel.driverId)}</Field>
        <Field label="Posto">{lookups.stationName(refuel.gasStationId)}</Field>
        <Field label="Combustível"><Tag>{FUEL_LABELS[refuel.fuelType]}</Tag></Field>
        <Field label="Tipo de veículo">{v ? VEHICLE_TYPE_LABELS[v.type] : '—'}</Field>
        <Field label="Litros abastecidos" mono>{liters(refuel.liters)}</Field>
        <Field label="Preço por litro" mono>{pricePerL(refuel.pricePerLiter)}</Field>
        <Field label="Total" mono>{brl(refuel.totalAmount)}</Field>
        <Field label="Quilometragem" mono>{km(refuel.mileage)}</Field>
        <Field label="Data e hora" mono full>{dateTimeBR(refuel.fueledAt)}</Field>
      </DetailGrid>
    </Modal>
  )
}
