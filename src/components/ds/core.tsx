// Primitivos "core" do design system: Badge, Button, Card, IconButton, StatCard, Tag.
// Portados fielmente do bundle (inline-style + CSS variables/tokens).
import type {
  ButtonHTMLAttributes,
  CSSProperties,
  HTMLAttributes,
  MouseEvent,
  ReactNode,
} from 'react'

// ---------------------------------------------------------------- Badge
type BadgeTone = 'neutral' | 'green' | 'amber' | 'red'

const badgeTones: Record<BadgeTone, { bg: string; fg: string; dot: string }> = {
  neutral: { bg: 'var(--gray-100)', fg: 'var(--text-strong)', dot: 'var(--gray-400)' },
  green: { bg: 'var(--green-50)', fg: 'var(--green-700)', dot: 'var(--go-green)' },
  amber: { bg: 'var(--amber-50)', fg: 'var(--amber-700)', dot: 'var(--signal-amber)' },
  red: { bg: 'var(--red-50)', fg: 'var(--red-600)', dot: 'var(--red-500)' },
}

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone
  dot?: boolean
}

export function Badge({ tone = 'neutral', dot = false, children, style, ...rest }: BadgeProps) {
  const t = badgeTones[tone] ?? badgeTones.neutral
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        height: 22,
        padding: '0 9px',
        background: t.bg,
        color: t.fg,
        fontFamily: 'var(--font-sans)',
        fontWeight: 600,
        fontSize: 12,
        lineHeight: 1,
        borderRadius: 'var(--radius-pill)',
        whiteSpace: 'nowrap',
        ...style,
      }}
      {...rest}
    >
      {dot && (
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: t.dot }} />
      )}
      {children}
    </span>
  )
}

// ---------------------------------------------------------------- Button
type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

const buttonSizes: Record<Size, CSSProperties> = {
  sm: { padding: '0 12px', height: 32, fontSize: 14 },
  md: { padding: '0 16px', height: 40, fontSize: 15 },
  lg: { padding: '0 22px', height: 48, fontSize: 16 },
}

const buttonVariants: Record<ButtonVariant, CSSProperties> = {
  primary: { background: 'var(--action-primary)', color: 'var(--action-on-primary)' },
  secondary: { background: 'var(--ink-navy)', color: 'var(--white)' },
  outline: {
    background: 'var(--white)',
    color: 'var(--text-primary)',
    borderColor: 'var(--border-default)',
  },
  ghost: { background: 'transparent', color: 'var(--text-strong)' },
  danger: { background: 'var(--status-error)', color: 'var(--white)' },
}

const buttonHover: Record<ButtonVariant, string> = {
  primary: 'var(--action-primary-hover)',
  secondary: '#1B2A3B',
  outline: 'var(--gray-50)',
  ghost: 'var(--gray-100)',
  danger: 'var(--red-600)',
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: Size
  iconLeft?: ReactNode
  iconRight?: ReactNode
  fullWidth?: boolean
}

export function Button({
  variant = 'primary',
  size = 'md',
  iconLeft,
  iconRight,
  fullWidth = false,
  disabled = false,
  children,
  style,
  type = 'button',
  ...rest
}: ButtonProps) {
  const s = buttonSizes[size] ?? buttonSizes.md
  return (
    <button
      type={type}
      disabled={disabled}
      onMouseEnter={(e) => {
        if (!disabled) e.currentTarget.style.background = buttonHover[variant]
      }}
      onMouseLeave={(e) => {
        if (!disabled)
          e.currentTarget.style.background = String(buttonVariants[variant].background)
      }}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        height: s.height,
        padding: s.padding,
        width: fullWidth ? '100%' : 'auto',
        fontFamily: 'var(--font-sans)',
        fontWeight: 600,
        fontSize: s.fontSize,
        lineHeight: 1,
        borderRadius: 'var(--radius-md)',
        border: '1px solid transparent',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition:
          'background var(--dur-fast) var(--ease-standard), border-color var(--dur-fast) var(--ease-standard), color var(--dur-fast) var(--ease-standard)',
        whiteSpace: 'nowrap',
        userSelect: 'none',
        ...buttonVariants[variant],
        ...style,
      }}
      {...rest}
    >
      {iconLeft}
      {children}
      {iconRight}
    </button>
  )
}

// ---------------------------------------------------------------- Card
export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: number | string
  interactive?: boolean
}

export function Card({
  padding = 20,
  interactive = false,
  children,
  style,
  ...rest
}: CardProps) {
  return (
    <div
      onMouseEnter={(e) => {
        if (interactive) e.currentTarget.style.boxShadow = 'var(--shadow-md)'
      }}
      onMouseLeave={(e) => {
        if (interactive) e.currentTarget.style.boxShadow = 'var(--shadow-sm)'
      }}
      style={{
        background: 'var(--surface-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-sm)',
        padding,
        fontFamily: 'var(--font-sans)',
        color: 'var(--text-primary)',
        transition: 'box-shadow var(--dur-base) var(--ease-standard)',
        cursor: interactive ? 'pointer' : 'default',
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  )
}

// ---------------------------------------------------------------- IconButton
type IconButtonVariant = 'primary' | 'outline' | 'ghost'

const iconButtonSizes: Record<Size, number> = { sm: 32, md: 40, lg: 48 }

const iconButtonVariants: Record<IconButtonVariant, CSSProperties> = {
  primary: {
    background: 'var(--action-primary)',
    color: 'var(--action-on-primary)',
    border: '1px solid transparent',
  },
  outline: {
    background: 'var(--white)',
    color: 'var(--text-primary)',
    border: '1px solid var(--border-default)',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--text-strong)',
    border: '1px solid transparent',
  },
}

const iconButtonHover: Record<IconButtonVariant, string> = {
  primary: 'var(--action-primary-hover)',
  outline: 'var(--gray-50)',
  ghost: 'var(--gray-100)',
}

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: IconButtonVariant
  size?: Size
  label: string
}

export function IconButton({
  variant = 'ghost',
  size = 'md',
  disabled = false,
  label,
  children,
  style,
  ...rest
}: IconButtonProps) {
  const dim = iconButtonSizes[size] ?? iconButtonSizes.md
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onMouseEnter={(e) => {
        if (!disabled) e.currentTarget.style.background = iconButtonHover[variant]
      }}
      onMouseLeave={(e) => {
        if (!disabled)
          e.currentTarget.style.background = String(iconButtonVariants[variant].background)
      }}
      style={{
        display: 'inline-grid',
        placeItems: 'center',
        width: dim,
        height: dim,
        borderRadius: 'var(--radius-md)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'background var(--dur-fast) var(--ease-standard)',
        ...iconButtonVariants[variant],
        ...style,
      }}
      {...rest}
    >
      {children}
    </button>
  )
}

// ---------------------------------------------------------------- StatCard
type Trend = 'up' | 'down' | 'flat'

const trendTones: Record<Trend, { color: string; glyph: string }> = {
  up: { color: 'var(--green-700)', glyph: '▲' },
  down: { color: 'var(--red-600)', glyph: '▼' },
  flat: { color: 'var(--text-secondary)', glyph: '—' },
}

export interface StatCardProps extends HTMLAttributes<HTMLDivElement> {
  label: string
  value: ReactNode
  unit?: ReactNode
  trend?: Trend
  trendValue?: ReactNode
  icon?: ReactNode
  accent?: boolean
}

export function StatCard({
  label,
  value,
  unit,
  trend,
  trendValue,
  icon,
  accent = false,
  style,
  ...rest
}: StatCardProps) {
  const t = trend ? trendTones[trend] : null
  return (
    <div
      style={{
        background: 'var(--surface-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-sm)',
        padding: 18,
        fontFamily: 'var(--font-sans)',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        minWidth: 0,
        ...style,
      }}
      {...rest}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>
          {label}
        </span>
        {icon && (
          <span
            style={{
              display: 'grid',
              placeItems: 'center',
              width: 28,
              height: 28,
              borderRadius: 'var(--radius-md)',
              background: accent ? 'var(--amber-50)' : 'var(--gray-50)',
              color: accent ? 'var(--amber-700)' : 'var(--text-secondary)',
            }}
          >
            {icon}
          </span>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
        <span
          style={{
            fontFamily: 'var(--font-number)',
            fontWeight: 600,
            fontSize: 30,
            lineHeight: 1,
            color: accent ? 'var(--amber-700)' : 'var(--text-primary)',
            letterSpacing: '-0.01em',
          }}
        >
          {value}
        </span>
        {unit && (
          <span
            style={{
              fontFamily: 'var(--font-number)',
              fontSize: 15,
              fontWeight: 500,
              color: 'var(--text-secondary)',
            }}
          >
            {unit}
          </span>
        )}
      </div>
      {t && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5 }}>
          <span style={{ color: t.color, fontWeight: 600 }}>
            {t.glyph} {trendValue}
          </span>
          <span style={{ color: 'var(--text-muted)' }}>vs. mês anterior</span>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------- Tag
export interface TagProps extends HTMLAttributes<HTMLSpanElement> {
  onRemove?: (e: MouseEvent<HTMLButtonElement>) => void
}

export function Tag({ children, onRemove, style, ...rest }: TagProps) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        height: 26,
        padding: onRemove ? '0 6px 0 10px' : '0 10px',
        background: 'var(--white)',
        color: 'var(--text-strong)',
        border: '1px solid var(--border-default)',
        fontFamily: 'var(--font-sans)',
        fontWeight: 500,
        fontSize: 13,
        lineHeight: 1,
        borderRadius: 'var(--radius-sm)',
        whiteSpace: 'nowrap',
        ...style,
      }}
      {...rest}
    >
      {children}
      {onRemove && (
        <button
          type="button"
          aria-label="Remover"
          onClick={onRemove}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--gray-100)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          style={{
            display: 'grid',
            placeItems: 'center',
            width: 18,
            height: 18,
            border: 'none',
            background: 'transparent',
            borderRadius: 'var(--radius-sm)',
            cursor: 'pointer',
            color: 'var(--text-secondary)',
            fontSize: 14,
            lineHeight: 1,
            padding: 0,
          }}
        >
          ×
        </button>
      )}
    </span>
  )
}
