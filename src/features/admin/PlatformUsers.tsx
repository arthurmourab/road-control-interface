// Usuários da plataforma (admin): todos os usuários de todas as organizações.
import { useMemo, useState } from 'react'
import { Avatar, Button, Card, Icon, Select } from '@/components/ds'
import {
  ConfirmDialog,
  DataTable,
  PageHeader,
  RoleBadge,
  SearchInput,
  StatusBadge,
  toast,
  type Column,
} from '@/components/ui'
import { useSetUserStatus, useUsers } from '@/api/users'
import { useOrganizations } from '@/api/organizations'
import { useGasStations } from '@/api/gasStations'
import { UserForm } from '@/features/fleet/UserForm'
import type { User } from '@/types/models'
import { tableState } from '@/lib/tableState'
import { ApiError } from '@/lib/api'

const PAGE = 8

export function PlatformUsers() {
  const [page, setPage] = useState(1)
  const [q, setQ] = useState('')
  const [orgFilter, setOrgFilter] = useState('')
  const [create, setCreate] = useState(false)
  const [confirm, setConfirm] = useState<User | null>(null)

  const query = useUsers({ pageSize: 1000, organizationId: orgFilter ? Number(orgFilter) : null })
  const orgsQuery = useOrganizations({ pageSize: 1000 })
  const stationsQuery = useGasStations({ pageSize: 1000 })
  const setStatus = useSetUserStatus()

  const orgsById = useMemo(
    () => new Map((orgsQuery.data?.results ?? []).map((o) => [o.id, o.name])),
    [orgsQuery.data],
  )
  const stationsById = useMemo(
    () => new Map((stationsQuery.data?.results ?? []).map((s) => [s.id, s.name])),
    [stationsQuery.data],
  )

  const all = useMemo(() => query.data?.results ?? [], [query.data])
  const filtered = useMemo(() => {
    if (!q) return all
    const s = q.toLowerCase()
    return all.filter(
      (u) => `${u.name} ${u.lastName}`.toLowerCase().includes(s) || u.email.toLowerCase().includes(s),
    )
  }, [all, q])

  const total = filtered.length
  const pageRows = filtered.slice((page - 1) * PAGE, page * PAGE)
  const state = tableState({ isLoading: query.isLoading, isError: query.isError, isEmpty: total === 0 })

  async function toggleStatus(u: User) {
    try {
      await setStatus.mutateAsync({ id: u.id, isActive: !u.isActive })
      toast({ tone: 'success', title: u.isActive ? 'Usuário desativado.' : 'Usuário ativado.', body: `${u.name} ${u.lastName}` })
    } catch (err) {
      toast({ tone: 'error', title: 'Não foi possível alterar o status.', body: err instanceof ApiError ? err.message : undefined })
    }
    setConfirm(null)
  }

  const orgOpts = [
    { value: '', label: 'Todas as organizações' },
    ...(orgsQuery.data?.results ?? []).map((o) => ({ value: String(o.id), label: o.name })),
  ]

  const columns: Column<User>[] = [
    {
      key: 'name',
      header: 'Nome',
      render: (u) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Avatar name={`${u.name} ${u.lastName}`} size="sm" tone={u.role === 'SystemAdmin' ? 'amber' : 'slate'} />
          <span style={{ fontSize: 14, fontWeight: 500 }}>{u.name} {u.lastName}</span>
        </div>
      ),
    },
    { key: 'email', header: 'E-mail', render: (u) => <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{u.email}</span> },
    { key: 'role', header: 'Papel', render: (u) => <RoleBadge role={u.role} /> },
    { key: 'org', header: 'Organização', render: (u) => <span style={{ fontSize: 14 }}>{u.organizationId ? orgsById.get(u.organizationId) ?? `#${u.organizationId}` : '—'}</span> },
    { key: 'station', header: 'Posto', render: (u) => <span style={{ fontSize: 14 }}>{u.gasStationId ? stationsById.get(u.gasStationId) ?? `#${u.gasStationId}` : '—'}</span> },
    { key: 'status', header: 'Status', render: (u) => <StatusBadge active={u.isActive} /> },
    {
      key: 'actions',
      header: '',
      align: 'right',
      nowrap: true,
      render: (u) => (
        <Button variant="ghost" size="sm" onClick={() => setConfirm(u)} style={{ color: u.isActive ? 'var(--red-600)' : 'var(--green-700)' }}>
          {u.isActive ? 'Desativar' : 'Ativar'}
        </Button>
      ),
    },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <PageHeader
        title="Usuários"
        subtitle="Usuários de todas as organizações da plataforma"
        actions={
          <Button variant="primary" iconLeft={<Icon name="user-plus" size={18} color="var(--ink-navy)" />} onClick={() => setCreate(true)}>
            Novo usuário
          </Button>
        }
      />

      <Card style={{ display: 'flex', alignItems: 'flex-end', gap: 14, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-strong)' }}>Buscar</span>
          <SearchInput placeholder="Nome ou e-mail…" value={q} onChange={(v) => { setQ(v); setPage(1) }} />
        </div>
        <Select label="Organização" options={orgOpts} value={orgFilter} onChange={(e) => { setOrgFilter(e.target.value); setPage(1) }} style={{ width: 280 }} />
      </Card>

      <DataTable
        columns={columns}
        rows={pageRows}
        state={state}
        page={page}
        pageSize={PAGE}
        total={total}
        onPage={setPage}
        onRetry={() => query.refetch()}
        rowKey={(u) => u.id}
        emptyProps={{
          icon: 'users',
          title: q || orgFilter ? 'Nenhum usuário encontrado' : 'Nenhum usuário',
          body: q || orgFilter ? 'Ajuste a busca ou o filtro de organização.' : 'Cadastre o primeiro usuário da plataforma.',
        }}
      />

      <UserForm open={create} scope="admin" onClose={() => setCreate(false)} onSaved={(name) => { setCreate(false); toast({ tone: 'success', title: 'Usuário criado.', body: name }) }} />
      <ConfirmDialog
        open={!!confirm}
        tone={confirm && confirm.isActive ? 'danger' : 'amber'}
        title={confirm && confirm.isActive ? 'Desativar usuário?' : 'Ativar usuário?'}
        icon="user-x"
        loading={setStatus.isPending}
        body={confirm ? `${confirm.name} ${confirm.lastName} ${confirm.isActive ? 'perderá o acesso à plataforma.' : 'voltará a ter acesso.'}` : ''}
        confirmLabel={confirm && confirm.isActive ? 'Desativar' : 'Ativar'}
        onConfirm={() => confirm && toggleStatus(confirm)}
        onClose={() => setConfirm(null)}
      />
    </div>
  )
}
