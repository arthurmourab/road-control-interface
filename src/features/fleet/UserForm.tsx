// Formulário de criação de usuário. Compartilhado:
// - escopo "fleet" (gestor): cria motorista na própria organização (papel fixo).
// - escopo "admin": escolhe papel e organização (obrigatória, exceto para admin).
import { useEffect, useState } from 'react'
import { Input, Select } from '@/components/ds'
import { Modal, toast } from '@/components/ui'
import { Button } from '@/components/ds'
import { useCreateUser } from '@/api/users'
import { useOrganizations } from '@/api/organizations'
import { useAuth } from '@/lib/auth'
import { ROLE_ID, ROLE_LABELS, type Role } from '@/types/enums'
import { ApiError } from '@/lib/api'

type UserFormScope = 'fleet' | 'admin'

// Papéis que o admin pode criar pela interface (Frentista fora do escopo).
const ADMIN_ROLE_OPTIONS: { value: Role; label: string }[] = [
  { value: 'OrganizationAdmin', label: ROLE_LABELS.OrganizationAdmin },
  { value: 'Driver', label: ROLE_LABELS.Driver },
  { value: 'SystemAdmin', label: ROLE_LABELS.SystemAdmin },
]

interface FormState {
  first: string
  last: string
  email: string
  password: string
  role: Role | ''
  org: string
}

export function UserForm({
  open,
  scope,
  onClose,
  onSaved,
}: {
  open: boolean
  scope: UserFormScope
  onClose: () => void
  onSaved: (name: string) => void
}) {
  const isAdmin = scope === 'admin'
  const { user } = useAuth()
  const createUser = useCreateUser()
  const orgsQuery = useOrganizations({ pageSize: 1000 }, { enabled: isAdmin && open })

  const [f, setF] = useState<FormState>({
    first: '',
    last: '',
    email: '',
    password: '',
    role: isAdmin ? '' : 'Driver',
    org: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (open) {
      setF({ first: '', last: '', email: '', password: '', role: isAdmin ? '' : 'Driver', org: '' })
      setErrors({})
    }
  }, [open, isAdmin])

  const set = (k: keyof FormState, v: string) => setF((s) => ({ ...s, [k]: v }))
  // Organização é exigida para papéis ligados a uma org (todos menos SystemAdmin).
  const needsOrg = isAdmin && f.role !== '' && f.role !== 'SystemAdmin'
  const orgOpts = (orgsQuery.data?.results ?? [])
    .filter((o) => o.isActive)
    .map((o) => ({ value: String(o.id), label: o.name }))

  async function save() {
    const e: Record<string, string> = {}
    if (!f.first) e.first = 'Informe o nome.'
    if (!f.last) e.last = 'Informe o sobrenome.'
    if (!f.email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.email)) e.email = 'E-mail inválido.'
    if (!f.password || f.password.length < 8) e.password = 'Mínimo de 8 caracteres.'
    if (isAdmin && !f.role) e.role = 'Selecione o papel.'
    if (needsOrg && !f.org) e.org = 'Organização obrigatória para este papel.'
    setErrors(e)
    if (Object.keys(e).length) return

    const role: Role = isAdmin ? (f.role as Role) : 'Driver'
    // Gestor cria sempre na própria organização; admin usa a selecionada.
    const organizationId = isAdmin
      ? role === 'SystemAdmin'
        ? null
        : Number(f.org)
      : (user?.organizationId ?? null)

    try {
      await createUser.mutateAsync({
        name: f.first,
        lastName: f.last,
        email: f.email,
        password: f.password,
        roleId: ROLE_ID[role],
        organizationId,
      })
      onSaved(`${f.first} ${f.last}`)
    } catch (err) {
      toast({
        tone: 'error',
        title: 'Não foi possível criar o usuário.',
        body: err instanceof ApiError ? err.message : undefined,
      })
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      width={620}
      title={isAdmin ? 'Novo usuário' : 'Novo motorista'}
      subtitle={isAdmin ? 'Crie um usuário em qualquer organização' : 'Na sua organização'}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={createUser.isPending}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={save} disabled={createUser.isPending}>
            {createUser.isPending ? 'Criando…' : 'Criar usuário'}
          </Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
          <Input label="Nome" placeholder="João" value={f.first} error={errors.first} onChange={(e) => set('first', e.target.value)} />
          <Input label="Sobrenome" placeholder="Pereira" value={f.last} error={errors.last} onChange={(e) => set('last', e.target.value)} />
          <Input label="E-mail" type="email" placeholder="nome@empresa.com.br" value={f.email} error={errors.email} onChange={(e) => set('email', e.target.value)} />
          <Input label="Senha" type="password" placeholder="••••••••" value={f.password} error={errors.password} onChange={(e) => set('password', e.target.value)} />
          {isAdmin ? (
            <Select
              label="Papel"
              placeholder="Selecione"
              options={ADMIN_ROLE_OPTIONS}
              value={f.role}
              error={errors.role}
              onChange={(e) => set('role', e.target.value)}
            />
          ) : (
            <Input label="Papel" value="Motorista" disabled readOnly />
          )}
          {needsOrg && (
            <Select
              label="Organização"
              placeholder="Selecione"
              options={orgOpts}
              value={f.org}
              error={errors.org}
              onChange={(e) => set('org', e.target.value)}
            />
          )}
        </div>
        {isAdmin && needsOrg && (
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            A organização é obrigatória para papéis que pertencem a uma empresa.
          </div>
        )}
      </div>
    </Modal>
  )
}
