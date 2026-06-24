// Barrel dos componentes de UI compartilhados.
export { ToastHost, toast } from './toast'
export type { ToastOptions } from './toast'
export { Spinner, EmptyState, ErrorState, LoadingState } from './states'
export type { EmptyStateProps, ErrorStateProps } from './states'
export { DataTable } from './DataTable'
export type { Column, DataTableProps, TableState } from './DataTable'
export { Modal, ConfirmDialog } from './Modal'
export type { ModalProps, ConfirmDialogProps } from './Modal'
export {
  PageHeader,
  SearchInput,
  StatusBadge,
  ScopeBadge,
  RoleBadge,
  DetailGrid,
  Field,
  Plate,
} from './misc'
export type { PageHeaderProps, SearchInputProps } from './misc'
