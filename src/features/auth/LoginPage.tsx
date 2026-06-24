// Tela de login (pública). Painel da marca + formulário. Wired ao AuthContext.
import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button, Icon, Input } from '@/components/ds'
import { useAuth } from '@/lib/auth'
import { ApiError } from '@/lib/api'

const schema = z.object({
  email: z.string().min(1, 'Informe o e-mail.').email('E-mail inválido.'),
  password: z.string().min(1, 'Informe a senha.'),
})

type FormValues = z.infer<typeof schema>

export function LoginPage() {
  const { status, login } = useAuth()
  const navigate = useNavigate()
  const [formError, setFormError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  if (status === 'authenticated') return <Navigate to="/" replace />

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null)
    try {
      await login(values.email, values.password)
      navigate('/', { replace: true })
    } catch (err) {
      if (err instanceof ApiError && (err.status === 400 || err.status === 401)) {
        setFormError('E-mail ou senha incorretos. Verifique e tente novamente.')
      } else {
        setFormError('Não foi possível entrar agora. Verifique sua conexão e tente novamente.')
      }
    }
  })

  return (
    <div style={{ minHeight: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr' }} className="rc-login">
      {/* Painel da marca */}
      <div
        className="rc-login-brand"
        style={{
          position: 'relative',
          background: 'var(--ink-navy)',
          color: 'var(--white)',
          padding: '56px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          overflow: 'hidden',
        }}
      >
        <svg
          viewBox="0 0 600 600"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.5 }}
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
        >
          <path
            d="M-40 470 C 180 470, 240 150, 460 150 S 760 -120, 900 -120"
            fill="none"
            stroke="var(--signal-amber)"
            strokeWidth="2.5"
            strokeDasharray="14 16"
            opacity="0.55"
          />
          <path
            d="M-40 540 C 200 540, 260 230, 480 230 S 800 -40, 940 -40"
            fill="none"
            stroke="rgba(255,255,255,0.12)"
            strokeWidth="1.5"
          />
          <circle cx="460" cy="150" r="9" fill="none" stroke="var(--signal-amber)" strokeWidth="2.5" />
          <circle cx="460" cy="150" r="2.5" fill="var(--signal-amber)" />
        </svg>
        <img
          src="/assets/roadcontrol-logo-horizontal-reverse.svg"
          alt="RoadControl"
          style={{ height: 26, position: 'relative' }}
        />
        <div style={{ position: 'relative' }}>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 38,
              lineHeight: 1.15,
              fontWeight: 600,
              margin: 0,
              letterSpacing: '-0.02em',
              maxWidth: 420,
            }}
          >
            Cada litro sob controle.
          </h1>
          <p
            style={{
              fontSize: 16,
              lineHeight: 1.6,
              color: 'rgba(255,255,255,0.72)',
              maxWidth: 400,
              marginTop: 18,
            }}
          >
            A ponte entre a sua frota e os postos parceiros. Registre, audite e enxergue cada
            abastecimento.
          </p>
        </div>
        <div style={{ position: 'relative', fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>
          © 2026 RoadControl · Plataforma de controle de combustível
        </div>
      </div>

      {/* Painel do formulário */}
      <div style={{ display: 'grid', placeItems: 'center', padding: 40, background: 'var(--surface-page)' }}>
        <form
          onSubmit={onSubmit}
          style={{ width: '100%', maxWidth: 380, display: 'flex', flexDirection: 'column', gap: 22 }}
        >
          <div>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 26,
                fontWeight: 600,
                margin: 0,
                color: 'var(--text-primary)',
              }}
            >
              Entrar
            </h2>
            <p style={{ fontSize: 14.5, color: 'var(--text-secondary)', marginTop: 6 }}>
              Acesse o painel da sua organização.
            </p>
          </div>

          {formError && (
            <div
              role="alert"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '12px 14px',
                background: 'var(--red-50)',
                border: '1px solid var(--red-100)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--red-600)',
                fontSize: 14,
              }}
            >
              <Icon name="alert-circle" size={18} color="var(--red-600)" />
              <span>{formError}</span>
            </div>
          )}

          <Input
            label="E-mail"
            type="email"
            placeholder="nome@empresa.com.br"
            autoFocus
            error={errors.email?.message}
            {...register('email')}
          />
          <div>
            <Input
              label="Senha"
              type="password"
              placeholder="••••••••"
              error={errors.password?.message}
              {...register('password')}
            />
            <div style={{ textAlign: 'right', marginTop: 8 }}>
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                style={{ fontSize: 13, color: 'var(--text-secondary)', textDecoration: 'none' }}
              >
                Esqueci minha senha
              </a>
            </div>
          </div>

          <Button
            variant="primary"
            type="submit"
            disabled={isSubmitting}
            iconRight={isSubmitting ? undefined : <Icon name="arrow-right" size={18} color="var(--ink-navy)" />}
            fullWidth
          >
            {isSubmitting ? 'Entrando…' : 'Entrar'}
          </Button>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 13,
              color: 'var(--text-muted)',
              justifyContent: 'center',
            }}
          >
            <Icon name="circle-help" size={15} color="var(--text-muted)" />
            <span>
              Problemas para acessar?{' '}
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                style={{ color: 'var(--amber-700)', textDecoration: 'none', fontWeight: 500 }}
              >
                Fale com o suporte
              </a>
            </span>
          </div>
        </form>
      </div>
    </div>
  )
}
