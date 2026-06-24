// Componentes de formulário: Input, Select, Switch, Checkbox.
// Portados do bundle. O `style` posiciona/dimensiona o campo (vai no wrapper),
// não no <input>/<select> interno — fiel ao design.
import {
  useEffect,
  useState,
  type CSSProperties,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
} from 'react'

// ---------------------------------------------------------------- Input
export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'prefix' | 'style'> {
  label?: ReactNode
  hint?: ReactNode
  error?: ReactNode
  prefix?: ReactNode
  suffix?: ReactNode
  numeric?: boolean
  style?: CSSProperties
}

export function Input({
  label,
  hint,
  error,
  prefix,
  suffix,
  numeric = false,
  disabled = false,
  id,
  style,
  ...rest
}: InputProps) {
  const [focused, setFocused] = useState(false)
  const borderColor = error
    ? 'var(--status-error)'
    : focused
      ? 'var(--signal-amber)'
      : 'var(--border-default)'
  return (
    <label htmlFor={id} style={{ display: 'block', fontFamily: 'var(--font-sans)', ...style }}>
      {label && (
        <span
          style={{
            display: 'block',
            fontSize: 14,
            fontWeight: 600,
            color: 'var(--text-strong)',
            marginBottom: 6,
          }}
        >
          {label}
        </span>
      )}
      <span
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          height: 44,
          padding: '0 12px',
          background: disabled ? 'var(--gray-50)' : 'var(--white)',
          border: `1px solid ${borderColor}`,
          borderRadius: 'var(--radius-md)',
          boxShadow: focused && !error ? '0 0 0 3px rgba(255,159,28,0.18)' : 'none',
          transition:
            'border-color var(--dur-fast) var(--ease-standard), box-shadow var(--dur-fast) var(--ease-standard)',
        }}
      >
        {prefix && (
          <span style={{ color: 'var(--text-secondary)', fontSize: 14, whiteSpace: 'nowrap' }}>
            {prefix}
          </span>
        )}
        <input
          id={id}
          disabled={disabled}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            flex: 1,
            minWidth: 0,
            border: 'none',
            outline: 'none',
            background: 'transparent',
            fontFamily: numeric ? 'var(--font-number)' : 'var(--font-sans)',
            fontSize: 15,
            fontWeight: numeric ? 500 : 400,
            color: 'var(--text-primary)',
          }}
          {...rest}
        />
        {suffix && (
          <span style={{ color: 'var(--text-secondary)', fontSize: 14, whiteSpace: 'nowrap' }}>
            {suffix}
          </span>
        )}
      </span>
      {(hint || error) && (
        <span
          style={{
            display: 'block',
            fontSize: 13,
            marginTop: 6,
            color: error ? 'var(--status-error-strong)' : 'var(--text-secondary)',
          }}
        >
          {error || hint}
        </span>
      )}
    </label>
  )
}

// ---------------------------------------------------------------- Select
export type SelectOption = string | { value: string | number; label: string }

export interface SelectProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'style'> {
  label?: ReactNode
  hint?: ReactNode
  error?: ReactNode
  options?: SelectOption[]
  placeholder?: string
  style?: CSSProperties
}

export function Select({
  label,
  hint,
  error,
  options = [],
  placeholder,
  disabled = false,
  id,
  style,
  ...rest
}: SelectProps) {
  const [focused, setFocused] = useState(false)
  const borderColor = error
    ? 'var(--status-error)'
    : focused
      ? 'var(--signal-amber)'
      : 'var(--border-default)'
  return (
    <label htmlFor={id} style={{ display: 'block', fontFamily: 'var(--font-sans)', ...style }}>
      {label && (
        <span
          style={{
            display: 'block',
            fontSize: 14,
            fontWeight: 600,
            color: 'var(--text-strong)',
            marginBottom: 6,
          }}
        >
          {label}
        </span>
      )}
      <span
        style={{
          position: 'relative',
          display: 'block',
          height: 44,
          background: disabled ? 'var(--gray-50)' : 'var(--white)',
          border: `1px solid ${borderColor}`,
          borderRadius: 'var(--radius-md)',
          boxShadow: focused && !error ? '0 0 0 3px rgba(255,159,28,0.18)' : 'none',
          transition:
            'border-color var(--dur-fast) var(--ease-standard), box-shadow var(--dur-fast) var(--ease-standard)',
        }}
      >
        <select
          id={id}
          disabled={disabled}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: '100%',
            height: '100%',
            padding: '0 38px 0 12px',
            border: 'none',
            outline: 'none',
            background: 'transparent',
            appearance: 'none',
            WebkitAppearance: 'none',
            fontFamily: 'var(--font-sans)',
            fontSize: 15,
            color: 'var(--text-primary)',
            cursor: disabled ? 'not-allowed' : 'pointer',
          }}
          {...rest}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((o) => {
            const value = typeof o === 'string' ? o : o.value
            const text = typeof o === 'string' ? o : o.label
            return (
              <option key={value} value={value}>
                {text}
              </option>
            )
          })}
        </select>
        <span
          aria-hidden
          style={{
            position: 'absolute',
            right: 14,
            top: '50%',
            transform: 'translateY(-50%)',
            width: 8,
            height: 8,
            borderRight: '2px solid var(--text-secondary)',
            borderBottom: '2px solid var(--text-secondary)',
            rotate: '45deg',
            marginTop: -3,
            pointerEvents: 'none',
          }}
        />
      </span>
      {(hint || error) && (
        <span
          style={{
            display: 'block',
            fontSize: 13,
            marginTop: 6,
            color: error ? 'var(--status-error-strong)' : 'var(--text-secondary)',
          }}
        >
          {error || hint}
        </span>
      )}
    </label>
  )
}

// ---------------------------------------------------------------- Switch
export interface SwitchProps {
  checked?: boolean
  onChange?: (checked: boolean) => void
  label?: ReactNode
  disabled?: boolean
  id?: string
  style?: CSSProperties
}

export function Switch({ checked = false, onChange, label, disabled = false, id, style }: SwitchProps) {
  const [on, setOn] = useState(checked)
  useEffect(() => setOn(checked), [checked])
  const toggle = () => {
    if (disabled) return
    const next = !on
    setOn(next)
    onChange?.(next)
  }
  return (
    <label
      htmlFor={id}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 10,
        fontFamily: 'var(--font-sans)',
        fontSize: 15,
        color: 'var(--text-primary)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        ...style,
      }}
    >
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={on}
        disabled={disabled}
        onClick={toggle}
        style={{
          position: 'relative',
          width: 42,
          height: 24,
          flex: 'none',
          padding: 0,
          border: 'none',
          borderRadius: 'var(--radius-pill)',
          background: on ? 'var(--go-green)' : 'var(--gray-300)',
          cursor: disabled ? 'not-allowed' : 'pointer',
          transition: 'background var(--dur-base) var(--ease-standard)',
        }}
      >
        <span
          style={{
            position: 'absolute',
            top: 2,
            left: on ? 20 : 2,
            width: 20,
            height: 20,
            borderRadius: '50%',
            background: 'var(--white)',
            boxShadow: 'var(--shadow-sm)',
            transition: 'left var(--dur-base) var(--ease-out)',
          }}
        />
      </button>
      {label && <span>{label}</span>}
    </label>
  )
}

// ---------------------------------------------------------------- Checkbox
export interface CheckboxProps {
  checked?: boolean
  onChange?: (checked: boolean) => void
  label?: ReactNode
  disabled?: boolean
  id?: string
  style?: CSSProperties
}

export function Checkbox({ checked = false, onChange, label, disabled = false, id, style }: CheckboxProps) {
  const [on, setOn] = useState(checked)
  useEffect(() => setOn(checked), [checked])
  const toggle = () => {
    if (disabled) return
    const next = !on
    setOn(next)
    onChange?.(next)
  }
  return (
    <label
      htmlFor={id}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 10,
        fontFamily: 'var(--font-sans)',
        fontSize: 15,
        color: 'var(--text-primary)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        ...style,
      }}
    >
      <button
        id={id}
        type="button"
        role="checkbox"
        aria-checked={on}
        disabled={disabled}
        onClick={toggle}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 20,
          height: 20,
          flex: 'none',
          padding: 0,
          borderRadius: 'var(--radius-sm)',
          border: on ? '1px solid var(--signal-amber)' : '1px solid var(--border-default)',
          background: on ? 'var(--signal-amber)' : 'var(--white)',
          cursor: disabled ? 'not-allowed' : 'pointer',
          transition:
            'background var(--dur-fast) var(--ease-standard), border-color var(--dur-fast) var(--ease-standard)',
        }}
      >
        {on && (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
            <path
              d="M2 6.2L4.8 9L10 3.2"
              stroke="var(--ink-navy)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>
      {label && <span>{label}</span>}
    </label>
  )
}
