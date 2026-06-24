// Registrar abastecimento (gestor lança pela frota; motorista lança o próprio).
// O total é calculado (litros × preço). A quilometragem não pode ser menor que a
// do veículo selecionado.
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Card, Icon, Input, Select } from '@/components/ds'
import { PageHeader, toast } from '@/components/ui'
import { useCreateFueling } from '@/api/fuelings'
import { useFleetLookups, type RefuelScope } from './lookups'
import { useAuth } from '@/lib/auth'
import { FUEL_OPTIONS, type FuelType } from '@/types/enums'
import { ApiError } from '@/lib/api'
import { brl, km, liters as fmtLiters, parseDecimal } from '@/lib/format'

interface FormState {
  vehicle: string
  station: string
  driver: string
  fuel: string
  liters: string
  ppl: string
  mileage: string
  fueledAt: string
}

function nowLocal(): string {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function RegisterRefuel({ scope = 'fleet' }: { scope?: RefuelScope }) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const isDriver = scope === 'driver'
  const lookups = useFleetLookups(scope, user)
  const createFueling = useCreateFueling()

  const [f, setF] = useState<FormState>({
    vehicle: '',
    station: '',
    driver: '',
    fuel: '',
    liters: '',
    ppl: '',
    mileage: '',
    fueledAt: nowLocal(),
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const set = (k: keyof FormState, v: string) => setF((s) => ({ ...s, [k]: v }))

  const litersN = parseDecimal(f.liters)
  const pplN = parseDecimal(f.ppl)
  const totalN = litersN > 0 && pplN > 0 ? litersN * pplN : 0
  const selectedVehicle = f.vehicle ? lookups.vehicleById(Number(f.vehicle)) : undefined
  const minOdo = selectedVehicle?.mileage ?? 0

  const vehicleOpts = lookups.vehicles
    .filter((v) => v.isActive !== false)
    .map((v) => ({ value: String(v.id), label: `${v.plate} — ${v.brand} ${v.model}` }))
  const stationOpts = lookups.stations
    .filter((s) => s.isActive)
    .map((s) => ({ value: String(s.id), label: s.name }))
  const driverOpts = lookups.drivers
    .filter((d) => d.isActive)
    .map((d) => ({ value: String(d.id), label: `${d.name} ${d.lastName}` }))

  function validate(): boolean {
    const e: Record<string, string> = {}
    if (!f.vehicle) e.vehicle = 'Selecione o veículo.'
    if (!f.station) e.station = 'Informe o posto.'
    if (!isDriver && !f.driver) e.driver = 'Selecione o motorista.'
    if (!f.fuel) e.fuel = 'Selecione o combustível.'
    if (!(litersN > 0)) e.liters = 'Informe um valor maior que zero.'
    if (!(pplN > 0)) e.ppl = 'Informe um valor maior que zero.'
    const odoN = parseDecimal(f.mileage)
    if (!(odoN >= 0)) e.mileage = 'Informe a quilometragem.'
    else if (selectedVehicle && odoN < minOdo)
      e.mileage = `Não pode ser menor que a atual do veículo (${km(minOdo)}).`
    if (!f.fueledAt) e.fueledAt = 'Informe a data e hora.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function submit() {
    if (!validate()) {
      toast({ tone: 'error', title: 'Revise os campos destacados.' })
      return
    }
    try {
      await createFueling.mutateAsync({
        vehicleId: Number(f.vehicle),
        gasStationId: Number(f.station),
        driverId: isDriver ? null : Number(f.driver),
        fuelType: f.fuel as FuelType,
        liters: litersN,
        pricePerLiter: pplN,
        mileage: Math.round(parseDecimal(f.mileage)),
        fueledAt: f.fueledAt,
      })
      toast({
        tone: 'success',
        title: 'Abastecimento registrado.',
        body: `${fmtLiters(litersN)} · ${brl(totalN)}`,
      })
      navigate(isDriver ? '/driver' : '/fleet/refuels')
    } catch (err) {
      toast({
        tone: 'error',
        title: 'Não foi possível registrar.',
        body: err instanceof ApiError ? err.message : undefined,
      })
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 760 }}>
      <PageHeader
        title="Registrar abastecimento"
        subtitle={
          isDriver ? 'Registre o abastecimento que você acabou de fazer' : 'Lance um abastecimento da frota'
        }
      />

      <Card style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
          <Select
            label="Veículo"
            placeholder="Selecione"
            options={vehicleOpts}
            value={f.vehicle}
            error={errors.vehicle}
            onChange={(e) => set('vehicle', e.target.value)}
          />
          {lookups.stationsAvailable ? (
            <Select
              label="Posto"
              placeholder="Selecione"
              options={stationOpts}
              value={f.station}
              error={errors.station}
              onChange={(e) => set('station', e.target.value)}
            />
          ) : (
            <Input
              label="Código do posto"
              numeric
              placeholder="Ex.: 12"
              value={f.station}
              error={errors.station}
              hint="A lista de postos não está disponível para o seu perfil. Informe o código."
              onChange={(e) => set('station', e.target.value.replace(/\D/g, ''))}
            />
          )}
          {!isDriver && (
            <Select
              label="Motorista"
              placeholder="Selecione"
              options={driverOpts}
              value={f.driver}
              error={errors.driver}
              onChange={(e) => set('driver', e.target.value)}
            />
          )}
          <Select
            label="Combustível"
            placeholder="Selecione"
            options={FUEL_OPTIONS}
            value={f.fuel}
            error={errors.fuel}
            onChange={(e) => set('fuel', e.target.value)}
          />
        </div>

        <div style={{ height: 1, background: 'var(--border-subtle)' }} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 18 }}>
          <Input
            label="Litros abastecidos"
            numeric
            suffix="L"
            placeholder="0,000"
            value={f.liters}
            error={errors.liters}
            onChange={(e) => set('liters', e.target.value)}
          />
          <Input
            label="Preço por litro"
            numeric
            prefix="R$"
            placeholder="0,000"
            value={f.ppl}
            error={errors.ppl}
            onChange={(e) => set('ppl', e.target.value)}
          />
          <div>
            <span
              style={{
                display: 'block',
                fontSize: 14,
                fontWeight: 600,
                color: 'var(--text-strong)',
                marginBottom: 6,
              }}
            >
              Total
            </span>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                height: 44,
                padding: '0 12px',
                background: 'var(--surface-sunken)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                fontFamily: 'var(--font-number)',
                fontSize: 16,
                fontWeight: 600,
                color: totalN > 0 ? 'var(--text-primary)' : 'var(--text-muted)',
              }}
            >
              {totalN > 0 ? brl(totalN) : 'R$ 0,00'}
            </div>
            <span style={{ display: 'block', fontSize: 13, marginTop: 6, color: 'var(--text-secondary)' }}>
              Calculado: litros × preço
            </span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
          <Input
            label="Quilometragem (odômetro)"
            numeric
            suffix="km"
            placeholder="0"
            value={f.mileage}
            error={errors.mileage}
            hint={selectedVehicle && !errors.mileage ? `Atual do veículo: ${km(minOdo)}` : undefined}
            onChange={(e) => set('mileage', e.target.value)}
          />
          <Input
            label="Data e hora do abastecimento"
            type="datetime-local"
            value={f.fueledAt}
            error={errors.fueledAt}
            onChange={(e) => set('fueledAt', e.target.value)}
          />
        </div>
      </Card>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
        <Button variant="outline" onClick={() => navigate(isDriver ? '/driver' : '/fleet/refuels')}>
          Cancelar
        </Button>
        <Button
          variant="primary"
          disabled={createFueling.isPending}
          iconLeft={<Icon name="check" size={18} color="var(--ink-navy)" />}
          onClick={submit}
        >
          {createFueling.isPending ? 'Registrando…' : 'Registrar abastecimento'}
        </Button>
      </div>
    </div>
  )
}
