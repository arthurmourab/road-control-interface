// Envelopes padrão da API RoadControl. Toda resposta vem em ApiResponse<T>;
// listagens vêm em PagedResult<T>.

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

export interface PagedResult<T> {
  currentPage: number
  pageSize: number
  totalRows: number
  results: T[]
}

// Parâmetros comuns de paginação enviados aos endpoints GetAll.
export interface PageParams {
  currentPage?: number
  pageSize?: number
}
