// Abastecimentos autorizados pelo frentista. O backend escopa GET /v1/fueling
// pelo attendant do token. O frentista não lista veículos/postos, então esses
// vínculos são exibidos por id (não há endpoint para resolver o nome no papel).
import { useState } from 'react'
import { Tag } from '@/components/ds'
import { DataTable, PageHeader, Plate, type Column } from '@/components/ui'
import { useFuelings } from '@/api/fuelings'
import { FUEL_LABELS } from '@/types/enums'
import type { Fueling } from '@/types/models'
import { brl, dateTimeBR, liters, pricePerL } from '@/lib/format'
import { tableState } from '@/lib/tableState'

const PAGE = 8

export function AttendantFuelings() {
  const [page, setPage] = useState(1)
  const query = useFuelings({ currentPage: page, pageSize: PAGE })

  const rows = query.data?.results ?? []
  const total = query.data?.totalRows ?? 0
  const state = tableState({ isLoading: query.isLoading, isError: query.isError, isEmpty: rows.length === 0 })

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
    { key: 'vehicle', header: 'Veículo', render: (r) => <Plate>{`#${r.vehicleId}`}</Plate> },
    { key: 'station', header: 'Posto', render: (r) => <span style={{ fontSize: 14 }}>{`Posto #${r.gasStationId}`}</span> },
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <PageHeader
        title="Abastecimentos autorizados"
        subtitle="Abastecimentos que você confirmou com o seu código"
      />
      <DataTable
        columns={columns}
        rows={rows}
        state={state}
        page={page}
        pageSize={PAGE}
        total={total}
        onPage={setPage}
        onRetry={() => query.refetch()}
        rowKey={(r) => r.id}
        emptyProps={{
          icon: 'receipt-text',
          title: 'Nenhum abastecimento autorizado',
          body: 'Os abastecimentos que você confirmar com o seu código aparecem aqui.',
        }}
      />
    </div>
  )
}
