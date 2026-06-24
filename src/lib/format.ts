// Formatação pt-BR. O número é o protagonista (Space Grotesk no design).

const nf = (min: number, max: number) =>
  new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: min,
    maximumFractionDigits: max,
  })

export function brl(value: number): string {
  return 'R$ ' + nf(2, 2).format(value)
}

export function liters(value: number): string {
  return nf(3, 3).format(value) + ' L'
}

export function pricePerL(value: number): string {
  return 'R$ ' + nf(3, 3).format(value)
}

export function km(value: number): string {
  return nf(0, 0).format(value) + ' km'
}

export function intBR(value: number): string {
  return nf(0, 0).format(value)
}

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

// Aceita Date ou string ISO vinda da API.
function toDate(d: Date | string): Date {
  return d instanceof Date ? d : new Date(d)
}

export function dateBR(d: Date | string): string {
  const date = toDate(d)
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`
}

export function dateTimeBR(d: Date | string): string {
  const date = toDate(d)
  return `${dateBR(date)} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

// CNPJ: 14 dígitos -> 00.000.000/0000-00
export function formatCnpj(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 14)
  return digits
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
}

// CEP: 8 dígitos -> 00000-000
export function formatCep(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 8)
  return digits.replace(/^(\d{5})(\d)/, '$1-$2')
}

// Converte "1.234,56" ou "1234.56" em número.
export function parseDecimal(value: string): number {
  const normalized = String(value).replace(/\./g, '').replace(',', '.')
  return parseFloat(normalized)
}
