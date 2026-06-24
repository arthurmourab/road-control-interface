// Deriva o estado visual da DataTable a partir de uma query do TanStack Query.
import type { TableState } from '@/components/ui'

export function tableState(opts: {
  isLoading: boolean
  isError: boolean
  isEmpty: boolean
}): TableState {
  if (opts.isLoading) return 'loading'
  if (opts.isError) return 'error'
  if (opts.isEmpty) return 'empty'
  return 'normal'
}
