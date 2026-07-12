// Equipe do posto (visão do Gestor do posto). O backend já restringe a
// listagem aos usuários do posto do chamador; ativar/desativar só é permitido
// para frentistas (o backend rejeita outros papéis — a ação nem é oferecida).
import { useMemo, useState } from 'react'
import { Avatar, Button, Icon } from '@/components/ds'
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
import { UserForm } from '@/features/fleet/UserForm'
import type { User } from '@/types/models'
import { tableState } from '@/lib/tableState'
import { ApiError } from '@/lib/api'

const PAGE = 8

export function StationTeam() {
  const [page, setPage] = useState(1)
  const [q, setQ] = useState('')
  const [form, setForm] = useState(false)
  const [confirm, setConfirm] = useState<User | null>(null)

  const query = useUsers({ pageSize: 1000 })
  const setStatus = useSetUserStatus()

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
      toast({ tone: 'success', title: u.isActive ? 'Frentista desativado.' : 'Frentista ativado.', body: `${u.name} ${u.lastName}` })
    } catch (err) {
      toast({ tone: 'error', title: 'Não foi possível alterar o status.', body: err instanceof ApiError ? err.message : undefined })
    }
    setConfirm(null)
  }

  const columns: Column<User>[] = [
    {
      key: 'name',
      header: 'Nome',
      render: (u) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Avatar name={`${u.name} ${u.lastName}`} size="sm" tone="slate" />
          <span style={{ fontSize: 14, fontWeight: 500 }}>{u.name} {u.lastName}</span>
        </div>
      ),
    },
    { key: 'email', header: 'E-mail', render: (u) => <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{u.email}</span> },
    { key: 'role', header: 'Papel', render: (u) => <RoleBadge role={u.role} /> },
    { key: 'status', header: 'Status', render: (u) => <StatusBadge active={u.isActive} /> },
    {
      key: 'actions',
      header: '',
      align: 'right',
      nowrap: true,
      // Ativar/desativar apenas frentistas — o backend rejeita para gestores.
      render: (u) =>
        u.role === 'GasStationAttendant' ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setConfirm(u)}
            style={{ color: u.isActive ? 'var(--red-600)' : 'var(--green-700)' }}
          >
            {u.isActive ? 'Desativar' : 'Ativar'}
          </Button>
        ) : null,
    },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <PageHeader
        title="Equipe do posto"
        subtitle="Frentistas e gestores do seu posto"
        actions={
          <Button
            variant="primary"
            iconLeft={<Icon name="user-plus" size={18} color="var(--ink-navy)" />}
            onClick={() => setForm(true)}
          >
            Novo usuário
          </Button>
        }
      />

      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
        <SearchInput
          placeholder="Buscar nome ou e-mail…"
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
        rowKey={(u) => u.id}
        emptyProps={{
          icon: 'users',
          title: q ? 'Ninguém encontrado' : 'Nenhum usuário na equipe',
          body: q ? 'Tente outra busca.' : 'Cadastre os frentistas e gestores do seu posto.',
        }}
      />

      <UserForm
        open={form}
        scope="station"
        onClose={() => setForm(false)}
        onSaved={(name) => {
          setForm(false)
          toast({ tone: 'success', title: 'Usuário cadastrado.', body: name })
        }}
      />
      <ConfirmDialog
        open={!!confirm}
        tone={confirm && confirm.isActive ? 'danger' : 'amber'}
        title={confirm && confirm.isActive ? 'Desativar frentista?' : 'Ativar frentista?'}
        icon="user-x"
        loading={setStatus.isPending}
        body={
          confirm
            ? `${confirm.name} ${confirm.lastName} ${
                confirm.isActive ? 'perderá o acesso à plataforma.' : 'voltará a ter acesso à plataforma.'
              }`
            : ''
        }
        confirmLabel={confirm && confirm.isActive ? 'Desativar' : 'Ativar'}
        onConfirm={() => confirm && toggleStatus(confirm)}
        onClose={() => setConfirm(null)}
      />
    </div>
  )
}
