// Perfil do usuário logado (qualquer papel). Dados vêm da sessão (/auth/me);
// permite trocar a senha via POST /v1/auth/change-password (autenticado).
import { useState } from 'react'
import { Avatar, Button, Card, Icon, Input } from '@/components/ds'
import { DetailGrid, Field, Modal, PageHeader, RoleBadge, toast } from '@/components/ui'
import { useAuth } from '@/lib/auth'
import { useChangePassword } from '@/api/auth'
import { ApiError } from '@/lib/api'
import { dateBR } from '@/lib/format'
import { ROLE_LABELS } from '@/types/enums'

export function ProfilePage() {
  const { user } = useAuth()

  // Sob RequireAuth o usuário sempre existe; guarda defensiva para o TS.
  if (!user) return null
  const fullName = `${user.name} ${user.lastName}`.trim()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 720 }}>
      <PageHeader title="Meu perfil" subtitle="Dados da sua conta na plataforma" />

      <Card padding={24}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <Avatar name={fullName} size="lg" tone={user.role === 'SystemAdmin' ? 'amber' : user.role === 'Driver' ? 'slate' : 'navy'} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 19, fontWeight: 600, color: 'var(--text-primary)' }}>
              {fullName}
            </div>
            <div style={{ marginTop: 5 }}>
              <RoleBadge role={user.role} />
            </div>
          </div>
        </div>

        <DetailGrid>
          <Field label="Nome">{user.name}</Field>
          <Field label="Sobrenome">{user.lastName}</Field>
          <Field label="E-mail" full>{user.email}</Field>
          <Field label="Papel">{ROLE_LABELS[user.role]}</Field>
          {user.organizationId !== null && (
            <Field label="Organização" mono>#{user.organizationId}</Field>
          )}
          {user.gasStationId !== null && (
            <Field label="Posto" mono>#{user.gasStationId}</Field>
          )}
          <Field label="Membro desde" mono>{dateBR(user.createdAt)}</Field>
        </DetailGrid>
      </Card>

      <ChangePasswordCard />
    </div>
  )
}

interface PasswordFormState {
  current: string
  next: string
  confirm: string
}

const EMPTY_FORM: PasswordFormState = { current: '', next: '', confirm: '' }

// Card "Senha de acesso": abre um modal de troca de senha (atual + nova + confirmação).
function ChangePasswordCard() {
  const changePassword = useChangePassword()
  const [open, setOpen] = useState(false)
  const [f, setF] = useState<PasswordFormState>(EMPTY_FORM)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const set = (k: keyof PasswordFormState, v: string) => setF((s) => ({ ...s, [k]: v }))

  function openModal() {
    setF(EMPTY_FORM)
    setErrors({})
    setOpen(true)
  }

  function close() {
    if (changePassword.isPending) return
    setOpen(false)
  }

  async function save() {
    const e: Record<string, string> = {}
    if (!f.current) e.current = 'Informe a senha atual.'
    if (!f.next) e.next = 'Informe a nova senha.'
    else if (f.next.length < 8) e.next = 'A nova senha deve ter pelo menos 8 caracteres.'
    else if (f.next === f.current) e.next = 'A nova senha deve ser diferente da atual.'
    if (!f.confirm) e.confirm = 'Confirme a nova senha.'
    else if (f.confirm !== f.next) e.confirm = 'A confirmação não confere com a nova senha.'
    setErrors(e)
    if (Object.keys(e).length) return

    try {
      await changePassword.mutateAsync({ currentPassword: f.current, newPassword: f.next })
      toast({ tone: 'success', title: 'Senha alterada.', body: 'Use a nova senha no próximo acesso.' })
      setOpen(false)
    } catch (err) {
      if (err instanceof ApiError && err.status === 422) {
        // Senha atual incorreta: erro no próprio campo, com a mensagem do backend.
        setErrors({ current: err.message || 'Senha atual incorreta.' })
      } else {
        toast({
          tone: 'error',
          title: 'Não foi possível alterar a senha.',
          body: err instanceof ApiError ? err.message : 'Tente novamente em instantes.',
        })
      }
    }
  }

  const pending = changePassword.isPending

  return (
    <Card padding={24}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>Senha de acesso</div>
          <div style={{ fontSize: 13.5, color: 'var(--text-secondary)', marginTop: 4, maxWidth: 420 }}>
            Troque a sua senha informando a senha atual e a nova senha.
          </div>
        </div>
        <Button
          variant="outline"
          iconLeft={<Icon name="key-round" size={17} color="var(--text-strong)" />}
          onClick={openModal}
        >
          Trocar senha
        </Button>
      </div>

      <Modal
        open={open}
        onClose={close}
        width={440}
        title="Trocar senha"
        subtitle="Informe a senha atual e a nova senha"
        footer={
          <>
            <Button variant="outline" onClick={close} disabled={pending}>Cancelar</Button>
            <Button variant="primary" onClick={save} disabled={pending}>
              {pending ? 'Salvando…' : 'Salvar nova senha'}
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Input
            label="Senha atual"
            type="password"
            placeholder="••••••••"
            autoFocus
            value={f.current}
            error={errors.current}
            onChange={(e) => set('current', e.target.value)}
          />
          <Input
            label="Nova senha"
            type="password"
            placeholder="••••••••"
            value={f.next}
            error={errors.next}
            onChange={(e) => set('next', e.target.value)}
          />
          <Input
            label="Confirmar nova senha"
            type="password"
            placeholder="••••••••"
            value={f.confirm}
            error={errors.confirm}
            onChange={(e) => set('confirm', e.target.value)}
          />
        </div>
      </Modal>
    </Card>
  )
}
