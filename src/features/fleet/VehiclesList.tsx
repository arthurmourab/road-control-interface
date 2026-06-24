// Frota: lista de veículos. Gestor cria/edita/ativa; motorista só visualiza.
import { useEffect, useMemo, useState } from 'react'
import { Button, Icon, Input, Select, Tag } from '@/components/ds'
import {
  ConfirmDialog,
  DataTable,
  Modal,
  PageHeader,
  Plate,
  SearchInput,
  StatusBadge,
  toast,
  type Column,
} from '@/components/ui'
import {
  useCreateVehicle,
  useSetVehicleStatus,
  useUpdateVehicle,
  useVehicles,
} from '@/api/vehicles'
import { useAuth } from '@/lib/auth'
import { VEHICLE_TYPE_LABELS, VEHICLE_TYPE_OPTIONS, type VehicleType } from '@/types/enums'
import type { Vehicle } from '@/types/models'
import { km, parseDecimal } from '@/lib/format'
import { tableState } from '@/lib/tableState'
import { ApiError } from '@/lib/api'
import type { RefuelScope } from './lookups'

const PAGE = 8
const isActive = (v: Vehicle) => v.isActive !== false

export function VehiclesList({ scope = 'fleet' }: { scope?: RefuelScope }) {
  const readOnly = scope === 'driver'
  const [page, setPage] = useState(1)
  const [q, setQ] = useState('')
  const [form, setForm] = useState<{ mode: 'create' | 'edit'; vehicle?: Vehicle } | null>(null)
  const [confirm, setConfirm] = useState<Vehicle | null>(null)

  const query = useVehicles({ pageSize: 1000 })
  const setStatus = useSetVehicleStatus()

  const all = useMemo(() => query.data?.results ?? [], [query.data])
  const filtered = useMemo(() => {
    if (!q) return all
    const s = q.toLowerCase()
    return all.filter(
      (v) =>
        v.plate.toLowerCase().includes(s) || `${v.brand} ${v.model}`.toLowerCase().includes(s),
    )
  }, [all, q])

  const total = filtered.length
  const pageRows = filtered.slice((page - 1) * PAGE, page * PAGE)
  const state = tableState({ isLoading: query.isLoading, isError: query.isError, isEmpty: total === 0 })

  async function toggleStatus(v: Vehicle) {
    try {
      await setStatus.mutateAsync({ id: v.id, isActive: !isActive(v) })
      toast({ tone: 'success', title: isActive(v) ? 'Veículo desativado.' : 'Veículo ativado.', body: v.plate })
    } catch (err) {
      toast({ tone: 'error', title: 'Não foi possível alterar o status.', body: err instanceof ApiError ? err.message : undefined })
    }
    setConfirm(null)
  }

  const columns: Column<Vehicle>[] = [
    { key: 'plate', header: 'Placa', nowrap: true, render: (v) => <Plate>{v.plate}</Plate> },
    {
      key: 'model',
      header: 'Marca / modelo',
      render: (v) => (
        <div>
          <div style={{ fontSize: 14, fontWeight: 500 }}>{v.brand}</div>
          <div style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>{v.model}</div>
        </div>
      ),
    },
    { key: 'type', header: 'Tipo', render: (v) => <Tag>{VEHICLE_TYPE_LABELS[v.type]}</Tag> },
    {
      key: 'year',
      header: 'Ano',
      align: 'right',
      nowrap: true,
      render: (v) => (
        <span style={{ fontFamily: 'var(--font-number)', fontSize: 13.5, color: 'var(--text-secondary)' }}>
          {v.yearManufacture}/{v.yearModel}
        </span>
      ),
    },
    {
      key: 'odo',
      header: 'Quilometragem',
      align: 'right',
      nowrap: true,
      render: (v) => <span style={{ fontFamily: 'var(--font-number)', fontSize: 14, fontWeight: 500 }}>{km(v.mileage)}</span>,
    },
    { key: 'status', header: 'Status', render: (v) => <StatusBadge active={isActive(v)} /> },
  ]
  if (!readOnly) {
    columns.push({
      key: 'actions',
      header: '',
      align: 'right',
      nowrap: true,
      render: (v) => (
        <div style={{ display: 'inline-flex', gap: 4 }} onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="sm" onClick={() => setForm({ mode: 'edit', vehicle: v })}>
            Editar
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setConfirm(v)}
            style={{ color: isActive(v) ? 'var(--red-600)' : 'var(--green-700)' }}
          >
            {isActive(v) ? 'Desativar' : 'Ativar'}
          </Button>
        </div>
      ),
    })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <PageHeader
        title="Frota"
        subtitle={readOnly ? 'Veículos da sua organização' : 'Veículos cadastrados na sua organização'}
        actions={
          !readOnly && (
            <Button
              variant="primary"
              iconLeft={<Icon name="plus" size={18} color="var(--ink-navy)" />}
              onClick={() => setForm({ mode: 'create' })}
            >
              Novo veículo
            </Button>
          )
        }
      />

      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
        <SearchInput
          placeholder="Buscar placa, marca, modelo…"
          value={q}
          onChange={(v) => {
            setQ(v)
            setPage(1)
          }}
        />
      </div>

      <DataTable
        columns={columns}
        rows={pageRows}
        state={state}
        page={page}
        pageSize={PAGE}
        total={total}
        onPage={setPage}
        onRetry={() => query.refetch()}
        rowKey={(v) => v.id}
        emptyProps={{
          icon: 'truck',
          title: q ? 'Nenhum veículo encontrado' : 'Nenhum veículo cadastrado',
          body: q
            ? 'Tente outra busca.'
            : 'Cadastre o primeiro veículo da frota para começar a registrar abastecimentos.',
          action:
            !readOnly && !q ? (
              <Button
                variant="primary"
                size="sm"
                iconLeft={<Icon name="plus" size={16} color="var(--ink-navy)" />}
                onClick={() => setForm({ mode: 'create' })}
              >
                Novo veículo
              </Button>
            ) : undefined,
        }}
      />

      {form && <VehicleForm data={form} onClose={() => setForm(null)} />}
      <ConfirmDialog
        open={!!confirm}
        tone={confirm && isActive(confirm) ? 'danger' : 'amber'}
        title={confirm && isActive(confirm) ? 'Desativar veículo?' : 'Ativar veículo?'}
        icon={confirm && isActive(confirm) ? 'power-off' : 'power'}
        loading={setStatus.isPending}
        body={
          confirm
            ? `${confirm.plate} — ${confirm.brand} ${confirm.model} ${
                isActive(confirm) ? 'deixará de aceitar novos abastecimentos.' : 'voltará a aceitar abastecimentos.'
              }`
            : ''
        }
        confirmLabel={confirm && isActive(confirm) ? 'Desativar' : 'Ativar'}
        onConfirm={() => confirm && toggleStatus(confirm)}
        onClose={() => setConfirm(null)}
      />
    </div>
  )
}

interface VehicleFormState {
  type: VehicleType | ''
  plate: string
  brand: string
  model: string
  yearManufacture: string
  yearModel: string
  mileage: string
}

function VehicleForm({
  data,
  onClose,
}: {
  data: { mode: 'create' | 'edit'; vehicle?: Vehicle }
  onClose: () => void
}) {
  const { user } = useAuth()
  const createVehicle = useCreateVehicle()
  const updateVehicle = useUpdateVehicle()
  const v = data.vehicle
  const [f, setF] = useState<VehicleFormState>({
    type: v?.type ?? '',
    plate: v?.plate ?? '',
    brand: v?.brand ?? '',
    model: v?.model ?? '',
    yearManufacture: v ? String(v.yearManufacture) : '',
    yearModel: v ? String(v.yearModel) : '',
    mileage: v ? String(v.mileage) : '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    setErrors({})
  }, [data])

  const set = (k: keyof VehicleFormState, val: string) => setF((s) => ({ ...s, [k]: val }))

  async function save() {
    const e: Record<string, string> = {}
    if (!f.type) e.type = 'Selecione o tipo.'
    if (!f.plate || !/^[A-Z]{3}-?\d[A-Z0-9]\d{2}$/i.test(f.plate.replace(/\s/g, '')))
      e.plate = 'Placa inválida (ABC-1234 ou ABC1D23).'
    if (!f.brand) e.brand = 'Informe a marca.'
    if (!f.model) e.model = 'Informe o modelo.'
    setErrors(e)
    if (Object.keys(e).length) return

    const base = {
      type: f.type as VehicleType,
      plate: f.plate,
      brand: f.brand,
      model: f.model,
      yearManufacture: Number(f.yearManufacture) || new Date().getFullYear(),
      yearModel: Number(f.yearModel) || new Date().getFullYear(),
      mileage: Math.round(parseDecimal(f.mileage)) || 0,
    }
    try {
      if (data.mode === 'create') {
        await createVehicle.mutateAsync({ ...base, organizationId: user?.organizationId ?? 0 })
        toast({ tone: 'success', title: 'Veículo cadastrado.', body: `${f.plate} — ${f.brand} ${f.model}` })
      } else if (v) {
        await updateVehicle.mutateAsync({ id: v.id, payload: base })
        toast({ tone: 'success', title: 'Veículo atualizado.', body: `${f.plate} — ${f.brand} ${f.model}` })
      }
      onClose()
    } catch (err) {
      toast({ tone: 'error', title: 'Não foi possível salvar.', body: err instanceof ApiError ? err.message : undefined })
    }
  }

  const pending = createVehicle.isPending || updateVehicle.isPending

  return (
    <Modal
      open
      onClose={onClose}
      width={620}
      title={data.mode === 'create' ? 'Novo veículo' : 'Editar veículo'}
      subtitle="Na sua organização"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={pending}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={save} disabled={pending}>
            {pending ? 'Salvando…' : 'Salvar veículo'}
          </Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
          <Select
            label="Tipo de veículo"
            placeholder="Selecione"
            options={VEHICLE_TYPE_OPTIONS}
            value={f.type}
            error={errors.type}
            onChange={(e) => set('type', e.target.value)}
          />
          <Input label="Placa" placeholder="ABC-1234" value={f.plate} error={errors.plate} onChange={(e) => set('plate', e.target.value.toUpperCase())} />
          <Input label="Marca" placeholder="Mercedes-Benz" value={f.brand} error={errors.brand} onChange={(e) => set('brand', e.target.value)} />
          <Input label="Modelo" placeholder="Accelo 1016" value={f.model} error={errors.model} onChange={(e) => set('model', e.target.value)} />
          <Input label="Ano de fabricação" numeric placeholder="2022" value={f.yearManufacture} onChange={(e) => set('yearManufacture', e.target.value)} />
          <Input label="Ano do modelo" numeric placeholder="2023" value={f.yearModel} onChange={(e) => set('yearModel', e.target.value)} />
        </div>
        <Input label="Quilometragem" numeric suffix="km" placeholder="0" value={f.mileage} onChange={(e) => set('mileage', e.target.value)} />
      </div>
    </Modal>
  )
}
