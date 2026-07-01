// Consulta de CEP via ViaCEP (API pública, sem autenticação).
// Não usa a instância axios de src/lib/api: ela injeta JWT e desembrulha
// ApiResponse<T>, o que não se aplica a uma API externa — aqui é fetch cru.
import { useQuery } from '@tanstack/react-query'

export interface CepAddress {
  street: string
  neighborhood: string
  city: string
  state: string
}

// Formato de resposta do ViaCEP (campos relevantes).
interface ViaCepResponse {
  logradouro?: string
  bairro?: string
  localidade?: string
  uf?: string
  erro?: boolean | string
}

// CEP com formato válido mas inexistente na base do ViaCEP.
export class CepNotFoundError extends Error {
  constructor() {
    super('CEP não encontrado.')
    this.name = 'CepNotFoundError'
  }
}

async function fetchCepAddress(cepDigits: string): Promise<CepAddress> {
  const res = await fetch(`https://viacep.com.br/ws/${cepDigits}/json/`)
  if (!res.ok) throw new Error('Falha ao consultar o CEP.')
  const body = (await res.json()) as ViaCepResponse
  if (body.erro) throw new CepNotFoundError()
  return {
    street: body.logradouro ?? '',
    neighborhood: body.bairro ?? '',
    city: body.localidade ?? '',
    state: body.uf ?? '',
  }
}

export const cepKeys = {
  lookup: (cepDigits: string) => ['cep', 'lookup', cepDigits] as const,
}

// Busca o endereço de um CEP. Só dispara quando o CEP tem 8 dígitos
// (e `enabled` externo permitir). Aceita o CEP formatado ou só dígitos.
export function useCepLookup(cep: string, options?: { enabled?: boolean }) {
  const digits = cep.replace(/\D/g, '')
  return useQuery({
    queryKey: cepKeys.lookup(digits),
    queryFn: () => fetchCepAddress(digits),
    enabled: digits.length === 8 && (options?.enabled ?? true),
    retry: false,
    staleTime: 5 * 60 * 1000, // endereço de CEP não muda no curto prazo
  })
}
