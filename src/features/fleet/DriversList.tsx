// Motoristas / usuários da organização (visão do gestor).
import { useMemo, useState } from 'react'
import { Avatar, Button, Icon } from '@/components/ds'
import {
  ConfirmDialog,
  DataTable,
  PageHeader,
  SearchInput,
  StatusBadge,
  toast,
  type Column,
} from '@/components/ui'
import { useSetUserStatus, useUsers } from '@/api/users'
import { UserForm } from './UserForm'
import type { User } from '@/types/models'
import { tableState } from '@/lib/tableState'
import { ApiError } from '@/lib/api'

const PAGE = 8

export function DriversList() {
  const [page, setPage] = useState(1)
  const [q, setQ] = useState('')
  const [form, setForm] = useState(false)
  const [confirm, setConfirm] = useState<User | null>(null)

  const query = useUsers({ pageSize: 1000 })
  const setStatus = useSetUserStatus()

  // Só motoristas: o endpoint devolve todos os usuários da organização
  // (inclusive o próprio gestor), mas esta tela gerencia apenas Drivers.
  const all = useMemo(
    () => (query.data?.results ?? []).filter((u) => u.role === 'Driver'),
    [query.data],
  )
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
    { key: 'status', header: 'Status', render: (u) => <StatusBadge active={u.isActive} /> },
    {
      key: 'actions',
      header: '',
      align: 'right',
      nowrap: true,
      render: (u) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setConfirm(u)}
          style={{ color: u.isActive ? 'var(--red-600)' : 'var(--green-700)' }}
        >
          {u.isActive ? 'Desativar' : 'Ativar'}
        </Button>
      ),
    },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <PageHeader
        title="Motoristas"
        subtitle="Usuários da sua organização"
        actions={
          <Button
            variant="primary"
            iconLeft={<Icon name="user-plus" size={18} color="var(--ink-navy)" />}
            onClick={() => setForm(true)}
          >
            Novo motorista
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
          title: q ? 'Nenhum motorista encontrado' : 'Nenhum motorista cadastrado',
          body: q ? 'Tente outra busca.' : 'Cadastre os motoristas para que eles possam registrar abastecimentos.',
        }}
      />

      <UserForm
        open={form}
        scope="fleet"
        onClose={() => setForm(false)}
        onSaved={(name) => {
          setForm(false)
          toast({ tone: 'success', title: 'Motorista cadastrado.', body: name })
        }}
      />
      <ConfirmDialog
        open={!!confirm}
        tone={confirm && confirm.isActive ? 'danger' : 'amber'}
        title={confirm && confirm.isActive ? 'Desativar usuário?' : 'Ativar usuário?'}
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
