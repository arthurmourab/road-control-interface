// Organizações (admin da plataforma): lista, criação e detalhe.
import { useEffect, useMemo, useState } from 'react'
import { Button, Icon, Input } from '@/components/ds'
import {
  DataTable,
  DetailGrid,
  Field,
  Modal,
  PageHeader,
  SearchInput,
  StatusBadge,
  toast,
  type Column,
} from '@/components/ui'
import { useCreateOrganization, useOrganizations } from '@/api/organizations'
import type { Organization } from '@/types/models'
import { dateBR, formatCnpj } from '@/lib/format'
import { tableState } from '@/lib/tableState'
import { ApiError } from '@/lib/api'

const PAGE = 8

export function OrgsList() {
  const [page, setPage] = useState(1)
  const [q, setQ] = useState('')
  const [create, setCreate] = useState(false)
  const [detail, setDetail] = useState<Organization | null>(null)

  const query = useOrganizations({ pageSize: 1000 })
  const all = useMemo(() => query.data?.results ?? [], [query.data])
  const filtered = useMemo(() => {
    if (!q) return all
    const s = q.toLowerCase()
    return all.filter((o) => o.name.toLowerCase().includes(s) || o.document.includes(q.replace(/\D/g, '')))
  }, [all, q])

  const total = filtered.length
  const pageRows = filtered.slice((page - 1) * PAGE, page * PAGE)
  const state = tableState({ isLoading: query.isLoading, isError: query.isError, isEmpty: total === 0 })

  const columns: Column<Organization>[] = [
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <PageHeader
        title="Organizações"
        subtitle="Empresas clientes da plataforma"
        actions={
          <Button variant="primary" iconLeft={<Icon name="plus" size={18} color="var(--ink-navy)" />} onClick={() => setCreate(true)}>
            Nova organização
          </Button>
        }
      />

      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
        <SearchInput placeholder="Buscar nome ou CNPJ…" value={q} onChange={(v) => { setQ(v); setPage(1) }} />
      </div>

      <DataTable
        columns={columns}
        rows={pageRows}
        state={state}
        page={page}
        pageSize={PAGE}
        total={total}
        onPage={setPage}
        onRowClick={(o) => setDetail(o)}
        onRetry={() => query.refetch()}
        rowKey={(o) => o.id}
        emptyProps={{
          icon: 'building-2',
          title: q ? 'Nenhuma organização encontrada' : 'Nenhuma organização',
          body: q ? 'Tente outra busca.' : 'Cadastre a primeira organização cliente da plataforma.',
        }}
      />

      <OrgForm open={create} onClose={() => setCreate(false)} onSaved={(name) => { setCreate(false); toast({ tone: 'success', title: 'Organização criada.', body: name }) }} />
      <OrgDetail org={detail} onClose={() => setDetail(null)} />
    </div>
  )
}

function OrgForm({ open, onClose, onSaved }: { open: boolean; onClose: () => void; onSaved: (name: string) => void }) {
  const createOrg = useCreateOrganization()
  const [f, setF] = useState({ name: '', cnpj: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (open) {
      setF({ name: '', cnpj: '' })
      setErrors({})
    }
  }, [open])

  async function save() {
    const e: Record<string, string> = {}
    if (!f.name) e.name = 'Informe o nome.'
    const digits = f.cnpj.replace(/\D/g, '')
    if (digits.length !== 14) e.cnpj = 'CNPJ deve ter 14 dígitos.'
    setErrors(e)
    if (Object.keys(e).length) return
    try {
      await createOrg.mutateAsync({ name: f.name, document: digits })
      onSaved(f.name)
    } catch (err) {
      toast({ tone: 'error', title: 'Não foi possível criar.', body: err instanceof ApiError ? err.message : undefined })
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      width={520}
      title="Nova organização"
      subtitle="Cadastre uma empresa cliente"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={createOrg.isPending}>Cancelar</Button>
          <Button variant="primary" onClick={save} disabled={createOrg.isPending}>{createOrg.isPending ? 'Criando…' : 'Criar organização'}</Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <Input label="Nome" placeholder="Transportadora Exemplo Ltda" value={f.name} error={errors.name} onChange={(e) => setF((s) => ({ ...s, name: e.target.value }))} />
        <Input label="CNPJ" numeric placeholder="00.000.000/0000-00" value={f.cnpj} error={errors.cnpj} onChange={(e) => setF((s) => ({ ...s, cnpj: formatCnpj(e.target.value) }))} />
      </div>
    </Modal>
  )
}

function OrgDetail({ org, onClose }: { org: Organization | null; onClose: () => void }) {
  if (!org) return null
  return (
    <Modal open={!!org} onClose={onClose} width={520} title={org.name} subtitle={formatCnpj(org.document)} footer={<Button variant="outline" onClick={onClose}>Fechar</Button>}>
      <DetailGrid cols={2}>
        <Field label="Razão social" full>{org.name}</Field>
        <Field label="CNPJ" mono>{formatCnpj(org.document)}</Field>
        <Field label="Status"><StatusBadge active={org.isActive} /></Field>
        <Field label="Data de cadastro" mono>{dateBR(org.createdAt)}</Field>
      </DetailGrid>
    </Modal>
  )
}
