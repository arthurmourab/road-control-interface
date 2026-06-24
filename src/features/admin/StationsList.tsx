// Postos parceiros (admin): lista, cadastro/edição, ativar/desativar e vínculo
// de organizações (somente para postos não-globais e já existentes).
import { useEffect, useMemo, useState } from 'react'
import { Button, Icon, Input, Select, Switch } from '@/components/ds'
import {
  ConfirmDialog,
  DataTable,
  Modal,
  PageHeader,
  ScopeBadge,
  SearchInput,
  StatusBadge,
  toast,
  type Column,
} from '@/components/ui'
import {
  useCreateGasStation,
  useGasStations,
  useLinkOrganizations,
  useUnlinkOrganization,
  useUpdateGasStation,
} from '@/api/gasStations'
import { useOrganizations } from '@/api/organizations'
import type { GasStation, UpdateGasStation } from '@/types/models'
import { formatCep, formatCnpj } from '@/lib/format'
import { tableState } from '@/lib/tableState'
import { ApiError } from '@/lib/api'

const PAGE = 8

export function StationsList() {
  const [page, setPage] = useState(1)
  const [q, setQ] = useState('')
  const [form, setForm] = useState<{ mode: 'create' | 'edit'; station?: GasStation } | null>(null)
  const [confirm, setConfirm] = useState<GasStation | null>(null)

  const query = useGasStations({ pageSize: 1000 })
  const updateStation = useUpdateGasStation()

  const all = useMemo(() => query.data?.results ?? [], [query.data])
  const filtered = useMemo(() => {
    if (!q) return all
    const s = q.toLowerCase()
    return all.filter(
      (p) =>
        p.name.toLowerCase().includes(s) ||
        p.document.includes(q.replace(/\D/g, '')) ||
        `${p.city} ${p.state}`.toLowerCase().includes(s),
    )
  }, [all, q])

  const total = filtered.length
  const pageRows = filtered.slice((page - 1) * PAGE, page * PAGE)
  const state = tableState({ isLoading: query.isLoading, isError: query.isError, isEmpty: total === 0 })

  function toPayload(p: GasStation, overrides: Partial<UpdateGasStation> = {}): UpdateGasStation {
    return {
      name: p.name,
      isGlobal: p.isGlobal,
      isActive: p.isActive,
      street: p.street,
      number: p.number,
      neighborhood: p.neighborhood,
      city: p.city,
      state: p.state,
      zipCode: p.zipCode,
      ...overrides,
    }
  }

  async function toggleStatus(p: GasStation) {
    try {
      await updateStation.mutateAsync({ id: p.id, payload: toPayload(p, { isActive: !p.isActive }) })
      toast({ tone: 'success', title: p.isActive ? 'Posto desativado.' : 'Posto ativado.', body: p.name })
    } catch (err) {
      toast({ tone: 'error', title: 'Não foi possível alterar o status.', body: err instanceof ApiError ? err.message : undefined })
    }
    setConfirm(null)
  }

  const columns: Column<GasStation>[] = [
    {
      key: 'name',
      header: 'Posto',
      render: (p) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
          <span style={{ display: 'grid', placeItems: 'center', width: 34, height: 34, borderRadius: 8, background: 'var(--ink-navy)', flex: 'none' }}>
            <Icon name="fuel" size={17} color="var(--signal-amber)" />
          </span>
          <span style={{ fontSize: 14, fontWeight: 500 }}>{p.name}</span>
        </div>
      ),
    },
    { key: 'cnpj', header: 'CNPJ', nowrap: true, render: (p) => <span style={{ fontFamily: 'var(--font-number)', fontSize: 13.5, color: 'var(--text-secondary)' }}>{formatCnpj(p.document)}</span> },
    { key: 'city', header: 'Cidade / UF', render: (p) => <span style={{ fontSize: 14 }}>{p.city} · {p.state}</span> },
    { key: 'scope', header: 'Alcance', render: (p) => <ScopeBadge global={p.isGlobal} /> },
    { key: 'status', header: 'Status', render: (p) => <StatusBadge active={p.isActive} /> },
    {
      key: 'actions',
      header: '',
      align: 'right',
      nowrap: true,
      render: (p) => (
        <div style={{ display: 'inline-flex', gap: 4 }} onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="sm" onClick={() => setForm({ mode: 'edit', station: p })}>Editar</Button>
          <Button variant="ghost" size="sm" onClick={() => setConfirm(p)} style={{ color: p.isActive ? 'var(--red-600)' : 'var(--green-700)' }}>
            {p.isActive ? 'Desativar' : 'Ativar'}
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <PageHeader
        title="Postos parceiros"
        subtitle="Rede de postos onde as frotas podem abastecer"
        actions={
          <Button variant="primary" iconLeft={<Icon name="plus" size={18} color="var(--ink-navy)" />} onClick={() => setForm({ mode: 'create' })}>
            Novo posto
          </Button>
        }
      />

      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
        <SearchInput placeholder="Buscar nome, CNPJ, cidade…" value={q} onChange={(v) => { setQ(v); setPage(1) }} width={300} />
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
        rowKey={(p) => p.id}
        emptyProps={{
          icon: 'fuel',
          title: q ? 'Nenhum posto encontrado' : 'Nenhum posto parceiro',
          body: q ? 'Tente outra busca.' : 'Cadastre o primeiro posto parceiro da rede.',
        }}
      />

      {form && <StationForm data={form} onClose={() => setForm(null)} />}
      <ConfirmDialog
        open={!!confirm}
        tone={confirm && confirm.isActive ? 'danger' : 'amber'}
        title={confirm && confirm.isActive ? 'Desativar posto?' : 'Ativar posto?'}
        icon="power-off"
        loading={updateStation.isPending}
        body={
          confirm
            ? `${confirm.name} ${confirm.isActive ? 'deixará de aceitar abastecimentos das frotas.' : 'voltará a aceitar abastecimentos.'}`
            : ''
        }
        confirmLabel={confirm && confirm.isActive ? 'Desativar' : 'Ativar'}
        onConfirm={() => confirm && toggleStatus(confirm)}
        onClose={() => setConfirm(null)}
      />
    </div>
  )
}

interface StationFormState {
  name: string
  cnpj: string
  isGlobal: boolean
  isActive: boolean
  street: string
  number: string
  neighborhood: string
  city: string
  state: string
  zipCode: string
}

function StationForm({ data, onClose }: { data: { mode: 'create' | 'edit'; station?: GasStation }; onClose: () => void }) {
  const isEdit = data.mode === 'edit'
  const p = data.station
  const createStation = useCreateGasStation()
  const updateStation = useUpdateGasStation()
  const linkOrgs = useLinkOrganizations()
  const unlinkOrg = useUnlinkOrganization()
  const orgsQuery = useOrganizations({ pageSize: 1000 })

  const [f, setF] = useState<StationFormState>({
    name: p?.name ?? '',
    cnpj: p ? formatCnpj(p.document) : '',
    isGlobal: p?.isGlobal ?? false,
    isActive: p?.isActive ?? true,
    street: p?.street ?? '',
    number: p?.number ?? '',
    neighborhood: p?.neighborhood ?? '',
    city: p?.city ?? '',
    state: p?.state ?? '',
    zipCode: p ? formatCep(p.zipCode) : '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [addOrg, setAddOrg] = useState('')
  const [removeOrg, setRemoveOrg] = useState<number | null>(null)

  useEffect(() => {
    setErrors({})
  }, [data])

  const set = (k: keyof StationFormState, v: string | boolean) => setF((s) => ({ ...s, [k]: v }))

  const orgsById = useMemo(
    () => new Map((orgsQuery.data?.results ?? []).map((o) => [o.id, o.name])),
    [orgsQuery.data],
  )
  const linked = p?.organizationIds ?? []
  const availableOrgs = (orgsQuery.data?.results ?? []).filter((o) => o.isActive && !linked.includes(o.id))

  async function save() {
    const e: Record<string, string> = {}
    if (!f.name) e.name = 'Informe o nome.'
    const digits = f.cnpj.replace(/\D/g, '')
    if (digits.length !== 14) e.cnpj = 'CNPJ deve ter 14 dígitos.'
    if (!f.city) e.city = 'Informe a cidade.'
    if (!f.state) e.state = 'UF.'
    setErrors(e)
    if (Object.keys(e).length) return

    const address = {
      street: f.street,
      number: f.number,
      neighborhood: f.neighborhood,
      city: f.city,
      state: f.state,
      zipCode: f.zipCode.replace(/\D/g, ''),
    }
    try {
      if (isEdit && p) {
        await updateStation.mutateAsync({
          id: p.id,
          payload: { name: f.name, isGlobal: f.isGlobal, isActive: f.isActive, ...address },
        })
        toast({ tone: 'success', title: 'Posto atualizado.', body: f.name })
      } else {
        await createStation.mutateAsync({ name: f.name, document: digits, isGlobal: f.isGlobal, ...address })
        toast({ tone: 'success', title: 'Posto cadastrado.', body: f.name })
      }
      onClose()
    } catch (err) {
      toast({ tone: 'error', title: 'Não foi possível salvar.', body: err instanceof ApiError ? err.message : undefined })
    }
  }

  async function addLink() {
    if (!addOrg || !p) return
    try {
      await linkOrgs.mutateAsync({ id: p.id, organizationIds: [Number(addOrg)] })
      toast({ tone: 'success', title: 'Organização vinculada.' })
      setAddOrg('')
    } catch (err) {
      toast({ tone: 'error', title: 'Não foi possível vincular.', body: err instanceof ApiError ? err.message : undefined })
    }
  }

  async function removeLink(orgId: number) {
    if (!p) return
    try {
      await unlinkOrg.mutateAsync({ id: p.id, organizationId: orgId })
      toast({ tone: 'success', title: 'Organização desvinculada.' })
    } catch (err) {
      toast({ tone: 'error', title: 'Não foi possível desvincular.', body: err instanceof ApiError ? err.message : undefined })
    }
    setRemoveOrg(null)
  }

  const pending = createStation.isPending || updateStation.isPending

  return (
    <Modal
      open
      onClose={onClose}
      width={680}
      title={isEdit ? 'Editar posto' : 'Novo posto parceiro'}
      subtitle="Dados cadastrais e alcance"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={pending}>Cancelar</Button>
          <Button variant="primary" onClick={save} disabled={pending}>{pending ? 'Salvando…' : 'Salvar posto'}</Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
          <Input label="Nome" placeholder="Posto Shell Marginal" value={f.name} error={errors.name} onChange={(e) => set('name', e.target.value)} />
          <Input
            label="CNPJ"
            numeric
            placeholder="00.000.000/0000-00"
            value={f.cnpj}
            error={errors.cnpj}
            disabled={isEdit}
            hint={isEdit ? 'O CNPJ não é editável.' : undefined}
            onChange={(e) => set('cnpj', formatCnpj(e.target.value))}
          />
        </div>

        <div style={{ display: 'flex', gap: 24, padding: '14px 16px', background: 'var(--surface-sunken)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)' }}>
          <Switch label="Posto global (disponível a todas as organizações)" checked={f.isGlobal} onChange={(v) => set('isGlobal', v)} />
          {isEdit && <Switch label="Ativo" checked={f.isActive} onChange={(v) => set('isActive', v)} />}
        </div>

        <div>
          <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.03em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 14 }}>
            Endereço
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 18, marginBottom: 18 }}>
            <Input label="Logradouro" placeholder="Av. das Nações Unidas" value={f.street} onChange={(e) => set('street', e.target.value)} />
            <Input label="Número" placeholder="12500" value={f.number} onChange={(e) => set('number', e.target.value)} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1.4fr 0.6fr 1fr', gap: 18 }}>
            <Input label="Bairro" placeholder="Brooklin" value={f.neighborhood} onChange={(e) => set('neighborhood', e.target.value)} />
            <Input label="Cidade" placeholder="São Paulo" value={f.city} error={errors.city} onChange={(e) => set('city', e.target.value)} />
            <Input label="UF" placeholder="SP" value={f.state} error={errors.state} onChange={(e) => set('state', e.target.value.toUpperCase().slice(0, 2))} />
            <Input label="CEP" numeric placeholder="00000-000" value={f.zipCode} onChange={(e) => set('zipCode', formatCep(e.target.value))} />
          </div>
        </div>

        {!f.isGlobal && (
          <div>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.03em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                Organizações com acesso
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 3 }}>
                {isEdit
                  ? 'Posto não-global: apenas as organizações vinculadas podem abastecer aqui.'
                  : 'Salve o posto primeiro para depois vincular organizações.'}
              </div>
            </div>

            {isEdit && p && (
              <>
                <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
                  <Select
                    placeholder="Selecionar organização…"
                    options={availableOrgs.map((o) => ({ value: String(o.id), label: o.name }))}
                    value={addOrg}
                    onChange={(e) => setAddOrg(e.target.value)}
                    style={{ flex: 1 }}
                  />
                  <Button
                    variant="outline"
                    disabled={!addOrg || linkOrgs.isPending}
                    onClick={addLink}
                    iconLeft={<Icon name="plus" size={16} color="var(--text-strong)" />}
                    style={{ alignSelf: 'flex-start' }}
                  >
                    Adicionar
                  </Button>
                </div>
                <div style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                  {linked.length === 0 ? (
                    <div style={{ padding: '18px 16px', fontSize: 13.5, color: 'var(--text-secondary)', textAlign: 'center' }}>
                      Nenhuma organização vinculada ainda.
                    </div>
                  ) : (
                    linked.map((id, i) => (
                      <div key={id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', borderBottom: i < linked.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                        <span style={{ display: 'grid', placeItems: 'center', width: 30, height: 30, borderRadius: 7, background: 'var(--surface-sunken)', flex: 'none' }}>
                          <Icon name="building-2" size={15} color="var(--text-secondary)" />
                        </span>
                        <span style={{ flex: 1, fontSize: 14 }}>{orgsById.get(id) ?? `Organização #${id}`}</span>
                        <Button variant="ghost" size="sm" onClick={() => setRemoveOrg(id)} style={{ color: 'var(--red-600)' }} iconLeft={<Icon name="unlink" size={15} color="var(--red-600)" />}>
                          Desvincular
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={removeOrg !== null}
        tone="danger"
        icon="unlink"
        title="Desvincular organização?"
        loading={unlinkOrg.isPending}
        body={removeOrg !== null ? `${orgsById.get(removeOrg) ?? 'A organização'} perderá o acesso para abastecer neste posto.` : ''}
        confirmLabel="Desvincular"
        onConfirm={() => removeOrg !== null && removeLink(removeOrg)}
        onClose={() => setRemoveOrg(null)}
      />
    </Modal>
  )
}
