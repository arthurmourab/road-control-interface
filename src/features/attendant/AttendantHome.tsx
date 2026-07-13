// Home do Frentista (GasStationAttendant): exibe o código de confirmação de
// abastecimento em destaque, com contador regressivo. O código é renovado pelo
// backend a cada ~60s; o hook refaz o GET ao expirar (ver useConfirmationCode).
import { useEffect, useState } from 'react'
import { Card, Icon } from '@/components/ds'
import { ErrorState, LoadingState, PageHeader } from '@/components/ui'
import { useConfirmationCode } from '@/api/fuelings'

export function AttendantHome() {
  const query = useConfirmationCode()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 560 }}>
      <PageHeader title="Código de confirmação" subtitle="Área do frentista" />
      {query.isLoading ? (
        <Card padding={0}>
          <LoadingState label="Gerando código…" />
        </Card>
      ) : query.isError || !query.data ? (
        <Card padding={0}>
          <ErrorState
            title="Não foi possível obter o código"
            body="Ocorreu um erro ao gerar o código de confirmação. Tente novamente."
            onRetry={() => query.refetch()}
          />
        </Card>
      ) : (
        <CodeCard code={query.data.code} secondsRemaining={query.data.secondsRemaining} />
      )}
    </div>
  )
}

// Cartão do código com contador. O tick de 1s é local (visual); a renovação real
// do código vem do refetch do hook, que troca a `key` e reinicia o contador.
function CodeCard({ code, secondsRemaining }: { code: string; secondsRemaining: number }) {
  const [remaining, setRemaining] = useState(secondsRemaining)

  useEffect(() => {
    setRemaining(secondsRemaining)
    const id = setInterval(() => {
      setRemaining((s) => (s > 0 ? s - 1 : 0))
    }, 1000)
    return () => clearInterval(id)
  }, [code, secondsRemaining])

  // Progresso relativo à janela inicial recebida do backend (piso de 1 para não dividir por zero).
  const pct = Math.max(0, Math.min(100, (remaining / Math.max(secondsRemaining, 1)) * 100))
  const low = remaining <= 10
  const barColor = low ? 'var(--red-500)' : 'var(--signal-amber)'

  return (
    <Card padding={28} style={{ display: 'flex', flexDirection: 'column', gap: 20, alignItems: 'center', textAlign: 'center' }}>
      <div style={{ fontSize: 13.5, color: 'var(--text-secondary)', maxWidth: 380, lineHeight: 1.5 }}>
        Informe este código ao motorista para confirmar o abastecimento.
      </div>

      <div
        aria-label={`Código de confirmação ${code.split('').join(' ')}`}
        style={{
          fontFamily: 'var(--font-number)',
          fontSize: 56,
          fontWeight: 600,
          letterSpacing: '0.14em',
          color: 'var(--text-primary)',
          // Compensa o letter-spacing à direita para manter o número óptico-centralizado.
          paddingLeft: '0.14em',
        }}
      >
        {code}
      </div>

      <div style={{ width: '100%', maxWidth: 320, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ height: 6, borderRadius: 'var(--radius-pill)', background: 'var(--surface-sunken)', overflow: 'hidden' }}>
          <div
            style={{
              width: `${pct}%`,
              height: '100%',
              background: barColor,
              borderRadius: 'var(--radius-pill)',
              transition: 'width 1s linear, background 300ms',
            }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 13, color: low ? 'var(--red-600)' : 'var(--text-secondary)' }}>
          <Icon name="rotate-cw" size={14} color={low ? 'var(--red-600)' : 'var(--text-muted)'} />
          {remaining > 0
            ? `Expira em ${remaining}s · renova automaticamente`
            : 'Renovando código…'}
        </div>
      </div>
    </Card>
  )
}
