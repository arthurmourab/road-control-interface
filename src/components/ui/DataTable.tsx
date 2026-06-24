// Tabela de dados com paginação e estados (normal/loading/empty/error).
// Genérica sobre o tipo da linha. O estado costuma vir do status do TanStack Query.
import type { ReactNode } from 'react'
import { Button, Card, Icon } from '@/components/ds'
import { EmptyState, ErrorState, type EmptyStateProps } from './states'
import { intBR } from '@/lib/format'

export type TableState = 'normal' | 'loading' | 'empty' | 'error'

export interface Column<T> {
  key: string
  header: ReactNode
  align?: 'left' | 'right' | 'center'
  nowrap?: boolean
  width?: number | string
  render: (row: T) => ReactNode
}

export interface DataTableProps<T> {
  columns: Column<T>[]
  rows: T[]
  state?: TableState
  page?: number
  pageSize?: number
  total?: number
  onPage?: (page: number) => void
  onRowClick?: (row: T) => void
  emptyProps?: EmptyStateProps
  onRetry?: () => void
  skeletonRows?: number
  rowKey?: (row: T) => string | number
}

export function DataTable<T>({
  columns,
  rows,
  state = 'normal',
  page = 1,
  pageSize = 8,
  total,
  onPage,
  onRowClick,
  emptyProps,
  onRetry,
  skeletonRows = 6,
  rowKey,
}: DataTableProps<T>) {
  const colCount = columns.length
  const tot = total != null ? total : rows.length
  const pages = Math.max(1, Math.ceil(tot / pageSize))

  return (
    <Card padding={0} style={{ overflow: 'hidden' }}>
      <div style={{ overflowX: 'auto' }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontFamily: 'var(--font-sans)',
            minWidth: 640,
          }}
        >
          <thead>
            <tr>
              {columns.map((c) => (
                <th
                  key={c.key}
                  style={{
                    textAlign: c.align || 'left',
                    fontSize: 11.5,
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    color: 'var(--text-muted)',
                    fontWeight: 600,
                    padding: '12px 16px',
                    borderBottom: '1px solid var(--border-subtle)',
                    background: 'var(--surface-sunken)',
                    whiteSpace: 'nowrap',
                    width: c.width,
                  }}
                >
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {state === 'loading' &&
              Array.from({ length: skeletonRows }).map((_, i) => (
                <tr key={'sk' + i}>
                  {columns.map((c, j) => (
                    <td
                      key={c.key}
                      style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-subtle)' }}
                    >
                      <span
                        style={{
                          display: 'block',
                          height: 12,
                          width: j === 0 ? '70%' : `${45 + ((i + j) % 4) * 12}%`,
                          borderRadius: 6,
                          background:
                            'linear-gradient(90deg,var(--gray-100),var(--gray-50),var(--gray-100))',
                          backgroundSize: '200% 100%',
                          animation: 'rcShimmer 1.3s ease-in-out infinite',
                        }}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            {state === 'error' && (
              <tr>
                <td colSpan={colCount} style={{ padding: 0 }}>
                  <ErrorState onRetry={onRetry} />
                </td>
              </tr>
            )}
            {state === 'empty' && (
              <tr>
                <td colSpan={colCount} style={{ padding: 0 }}>
                  <EmptyState {...(emptyProps ?? { title: 'Nada por aqui' })} />
                </td>
              </tr>
            )}
            {state === 'normal' &&
              rows.map((r, i) => (
                <tr
                  key={rowKey ? rowKey(r) : i}
                  onClick={onRowClick ? () => onRowClick(r) : undefined}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-sunken)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  style={{ cursor: onRowClick ? 'pointer' : 'default', transition: 'background 120ms' }}
                >
                  {columns.map((c) => (
                    <td
                      key={c.key}
                      style={{
                        padding: '13px 16px',
                        borderBottom: '1px solid var(--border-subtle)',
                        textAlign: c.align || 'left',
                        whiteSpace: c.nowrap ? 'nowrap' : 'normal',
                        verticalAlign: 'middle',
                      }}
                    >
                      {c.render(r)}
                    </td>
                  ))}
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      {state === 'normal' && tot > 0 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            borderTop: '1px solid var(--border-subtle)',
            background: 'var(--white)',
          }}
        >
          <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            Página{' '}
            <strong style={{ fontFamily: 'var(--font-number)', color: 'var(--text-primary)' }}>
              {page}
            </strong>{' '}
            de{' '}
            <strong style={{ fontFamily: 'var(--font-number)', color: 'var(--text-primary)' }}>
              {pages}
            </strong>{' '}
            · <span style={{ fontFamily: 'var(--font-number)' }}>{intBR(tot)}</span> registros
          </span>
          <div style={{ display: 'flex', gap: 6 }}>
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => onPage?.(page - 1)}
              iconLeft={<Icon name="chevron-left" size={16} color="var(--text-strong)" />}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= pages}
              onClick={() => onPage?.(page + 1)}
              iconRight={<Icon name="chevron-right" size={16} color="var(--text-strong)" />}
            >
              Próxima
            </Button>
          </div>
        </div>
      )}
    </Card>
  )
}
