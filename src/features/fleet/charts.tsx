// Gráficos simples em SVG, alinhados à marca (sem libs de chart).
import { brl } from '@/lib/format'

export interface SeriesPoint {
  label: string
  value: number
}

export function AreaChart({ series, color = 'var(--signal-amber)' }: { series: SeriesPoint[]; color?: string }) {
  const W = 640
  const H = 200
  const pad = 8
  const safe = series.length > 1 ? series : [...series, ...series]
  const max = Math.max(1, ...safe.map((s) => s.value)) * 1.15
  const x = (i: number) => pad + (i * (W - pad * 2)) / (safe.length - 1)
  const y = (v: number) => H - pad - (v / max) * (H - pad * 2)
  const line = safe.map((s, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(s.value).toFixed(1)}`).join(' ')
  const area = `${line} L${x(safe.length - 1).toFixed(1)},${H - pad} L${x(0).toFixed(1)},${H - pad} Z`
  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ width: '100%', height: 200, display: 'block' }}>
        <defs>
          <linearGradient id="rcArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(255,159,28,0.22)" />
            <stop offset="100%" stopColor="rgba(255,159,28,0)" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((g) => (
          <line key={g} x1={pad} x2={W - pad} y1={pad + g * (H - pad * 2)} y2={pad + g * (H - pad * 2)} stroke="var(--gray-100)" strokeWidth="1" />
        ))}
        <path d={area} fill="url(#rcArea)" />
        <path d={line} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        {safe.map((s, i) => (
          <circle key={i} cx={x(i)} cy={y(s.value)} r={i === safe.length - 1 ? 4 : 0} fill={color} stroke="var(--white)" strokeWidth="2" />
        ))}
      </svg>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
        {series.map((s, i) => (
          <span key={i} style={{ fontFamily: 'var(--font-number)', fontSize: 11.5, color: 'var(--text-muted)' }}>
            {s.label}
          </span>
        ))}
      </div>
    </div>
  )
}

export interface SpendBar {
  id: string
  label: string
  value: number
}

export function SpendBars({ rows }: { rows: SpendBar[] }) {
  const max = Math.max(1, ...rows.map((r) => r.value))
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {rows.map((r, i) => (
        <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ width: 78, flex: 'none', fontFamily: 'var(--font-number)', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
            {r.label}
          </span>
          <div style={{ flex: 1, height: 10, background: 'var(--surface-sunken)', borderRadius: 999, overflow: 'hidden' }}>
            <div
              style={{
                width: `${(r.value / max) * 100}%`,
                height: '100%',
                background: i === 0 ? 'var(--signal-amber)' : 'var(--ink-navy)',
                borderRadius: 999,
                transition: 'width 320ms cubic-bezier(0.16,1,0.3,1)',
              }}
            />
          </div>
          <span style={{ width: 92, flex: 'none', textAlign: 'right', fontFamily: 'var(--font-number)', fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>
            {brl(r.value)}
          </span>
        </div>
      ))}
    </div>
  )
}

// Gráfico de barras verticais (usado no painel da plataforma).
export function VBarChart({ series }: { series: SeriesPoint[] }) {
  const max = Math.max(1, ...series.map((s) => s.value)) * 1.12
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 20, height: 190, paddingTop: 8 }}>
      {series.map((s, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 9 }}>
          <span style={{ fontFamily: 'var(--font-number)', fontSize: 12, color: 'var(--text-muted)' }}>
            {Intl.NumberFormat('pt-BR').format(s.value)}
          </span>
          <div style={{ width: '100%', display: 'flex', alignItems: 'flex-end', height: '100%' }}>
            <div
              style={{
                width: '100%',
                height: `${(s.value / max) * 100}%`,
                background: i === series.length - 1 ? 'var(--signal-amber)' : 'var(--ink-navy)',
                borderRadius: '6px 6px 0 0',
                transition: 'height 320ms cubic-bezier(0.16,1,0.3,1)',
              }}
            />
          </div>
          <span style={{ fontFamily: 'var(--font-number)', fontSize: 12, color: 'var(--text-muted)' }}>{s.label}</span>
        </div>
      ))}
    </div>
  )
}
