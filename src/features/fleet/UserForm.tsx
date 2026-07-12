// Formulário de criação de usuário. Compartilhado:
// - escopo "fleet" (gestor de frota): cria motorista na própria organização (papel fixo).
// - escopo "admin" (SystemAdmin): escolhe papel; organização obrigatória para
//   gestor de frota/motorista, posto obrigatório para gestor do posto/frentista,
//   SystemAdmin sem vínculo (nunca org e posto ao mesmo tempo).
// - escopo "station" (gestor do posto): cria frentista ou gestor do posto no
//   próprio posto (gasStationId omitido — o backend assume o do chamador).
import { useEffect, useState } from 'react'
import { Input, Select } from '@/components/ds'
import { Modal, toast } from '@/components/ui'
import { Button } from '@/components/ds'
import { useCreateUser } from '@/api/users'
import { useOrganizations } from '@/api/organizations'
import { useGasStations } from '@/api/gasStations'
import { useAuth } from '@/lib/auth'
import { ROLE_ID, ROLE_LABELS, type Role } from '@/types/enums'
import { ApiError } from '@/lib/api'

type UserFormScope = 'fleet' | 'admin' | 'station'

// Papéis que o admin pode criar pela interface.
const ADMIN_ROLE_OPTIONS: { value: Role; label: string }[] = [
  { value: 'OrganizationAdmin', label: ROLE_LABELS.OrganizationAdmin },
  { value: 'Driver', label: ROLE_LABELS.Driver },
  { value: 'GasStationAdmin', label: ROLE_LABELS.GasStationAdmin },
  { value: 'GasStationAttendant', label: ROLE_LABELS.GasStationAttendant },
  { value: 'SystemAdmin', label: ROLE_LABELS.SystemAdmin },
]

// Papéis que o gestor do posto pode criar (sempre no próprio posto).
const STATION_ROLE_OPTIONS: { value: Role; label: string }[] = [
  { value: 'GasStationAttendant', label: ROLE_LABELS.GasStationAttendant },
  { value: 'GasStationAdmin', label: ROLE_LABELS.GasStationAdmin },
]

interface FormState {
  first: string
  last: string
  email: string
  password: string
  role: Role | ''
  org: string
  station: string
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
  const isStation = scope === 'station'
  const { user } = useAuth()
  const createUser = useCreateUser()
  const orgsQuery = useOrganizations({ pageSize: 1000 }, { enabled: isAdmin && open })
  // Só o SystemAdmin lista postos — o escopo "station" não precisa (posto do chamador).
  const stationsQuery = useGasStations({ pageSize: 1000 }, { enabled: isAdmin && open })

  const emptyForm: FormState = {
    first: '',
    last: '',
    email: '',
    password: '',
    role: scope === 'fleet' ? 'Driver' : '',
    org: '',
    station: '',
  }
  const [f, setF] = useState<FormState>(emptyForm)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (open) {
      setF({ first: '', last: '', email: '', password: '', role: scope === 'fleet' ? 'Driver' : '', org: '', station: '' })
      setErrors({})
    }
  }, [open, scope])

  const set = (k: keyof FormState, v: string) => setF((s) => ({ ...s, [k]: v }))
  // Vínculo por papel (escopo admin): organização para gestor de frota/motorista,
  // posto para gestor do posto/frentista, nenhum para SystemAdmin.
  const needsOrg = isAdmin && (f.role === 'OrganizationAdmin' || f.role === 'Driver')
  const needsStation = isAdmin && (f.role === 'GasStationAdmin' || f.role === 'GasStationAttendant')
  const orgOpts = (orgsQuery.data?.results ?? [])
    .filter((o) => o.isActive)
    .map((o) => ({ value: String(o.id), label: o.name }))
  const stationOpts = (stationsQuery.data?.results ?? [])
    .filter((s) => s.isActive)
    .map((s) => ({ value: String(s.id), label: s.name }))

  async function save() {
    const e: Record<string, string> = {}
    if (!f.first) e.first = 'Informe o nome.'
    if (!f.last) e.last = 'Informe o sobrenome.'
    if (!f.email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.email)) e.email = 'E-mail inválido.'
    if (!f.password || f.password.length < 8) e.password = 'Mínimo de 8 caracteres.'
    if ((isAdmin || isStation) && !f.role) e.role = 'Selecione o papel.'
    if (needsOrg && !f.org) e.org = 'Organização obrigatória para este papel.'
    if (needsStation && !f.station) e.station = 'Posto obrigatório para este papel.'
    setErrors(e)
    if (Object.keys(e).length) return

    const role: Role = scope === 'fleet' ? 'Driver' : (f.role as Role)
    // Vínculos por escopo (nunca organização e posto ao mesmo tempo):
    // - fleet: sempre a organização do próprio gestor;
    // - admin: organização ou posto selecionado, conforme o papel;
    // - station: gasStationId omitido — o backend assume o posto do chamador.
    const organizationId =
      scope === 'fleet' ? (user?.organizationId ?? null) : needsOrg ? Number(f.org) : null
    const gasStationId = needsStation ? Number(f.station) : isStation ? undefined : null

    try {
      await createUser.mutateAsync({
        name: f.first,
        lastName: f.last,
        email: f.email,
        password: f.password,
        roleId: ROLE_ID[role],
        organizationId,
        gasStationId,
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
      title={scope === 'fleet' ? 'Novo motorista' : 'Novo usuário'}
      subtitle={
        isAdmin
          ? 'Crie um usuário com o vínculo adequado ao papel'
          : isStation
            ? 'Na equipe do seu posto'
            : 'Na sua organização'
      }
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
          {scope === 'fleet' ? (
            <Input label="Papel" value="Motorista" disabled readOnly />
          ) : (
            <Select
              label="Papel"
              placeholder="Selecione"
              options={isStation ? STATION_ROLE_OPTIONS : ADMIN_ROLE_OPTIONS}
              value={f.role}
              error={errors.role}
              onChange={(e) => set('role', e.target.value)}
            />
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
          {needsStation && (
            <Select
              label="Posto parceiro"
              placeholder="Selecione"
              options={stationOpts}
              value={f.station}
              error={errors.station}
              onChange={(e) => set('station', e.target.value)}
            />
          )}
        </div>
        {isAdmin && needsOrg && (
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            A organização é obrigatória para papéis que pertencem a uma empresa.
          </div>
        )}
        {isAdmin && needsStation && (
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            O posto parceiro é obrigatório para papéis que trabalham em um posto.
          </div>
        )}
        {isStation && (
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            O usuário será criado no seu posto.
          </div>
        )}
      </div>
    </Modal>
  )
}
