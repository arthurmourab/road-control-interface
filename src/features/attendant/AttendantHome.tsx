// Home mínima do Frentista (GasStationAttendant). As funcionalidades do papel
// (confirmação de abastecimentos no posto etc.) ainda estão em desenvolvimento;
// esta tela existe para o papel nunca cair em rota vazia/quebrada.
import { Card } from '@/components/ds'
import { EmptyState, PageHeader } from '@/components/ui'

export function AttendantHome() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <PageHeader title="Posto" subtitle="Área do frentista" />
      <Card padding={0}>
        <EmptyState
          icon="fuel"
          title="Funcionalidades em desenvolvimento"
          body="A área do frentista ainda está sendo construída. Em breve você poderá acompanhar e confirmar os abastecimentos do seu posto por aqui."
        />
      </Card>
    </div>
  )
}
