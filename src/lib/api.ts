// Cliente HTTP da API RoadControl.
// - Injeta o JWT Bearer em toda requisição.
// - Desembrulha o envelope ApiResponse<T>, devolvendo apenas `data`.
// - Converte falhas (4xx/5xx) em ApiError com a mensagem do backend.
// - Em 401, limpa o token e emite um evento para o AuthProvider deslogar.
import axios, { type AxiosRequestConfig, type AxiosResponse } from 'axios'
import type { ApiResponse } from '@/types/api'
import { getToken, clearToken } from './token'

export const UNAUTHORIZED_EVENT = 'rc-unauthorized'

export class ApiError extends Error {
  status?: number
  constructor(message: string, status?: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

// Em dev, baseURL vazia + proxy do Vite (/v1 -> localhost:5254).
// Em produção, defina VITE_API_URL com a origem do backend.
const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '',
})

http.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      clearToken()
      window.dispatchEvent(new Event(UNAUTHORIZED_EVENT))
    }
    return Promise.reject(error)
  },
)

async function request<T>(promise: Promise<AxiosResponse<ApiResponse<T>>>): Promise<T> {
  try {
    const response = await promise
    const body = response.data
    if (body && body.success === false) {
      throw new ApiError(body.error ?? 'Ocorreu um erro inesperado.')
    }
    return body.data as T
  } catch (error) {
    if (error instanceof ApiError) throw error
    if (axios.isAxiosError(error)) {
      const body = error.response?.data as ApiResponse<unknown> | undefined
      throw new ApiError(
        body?.error ?? 'Não foi possível concluir a operação. Tente novamente.',
        error.response?.status,
      )
    }
    throw error
  }
}

export const api = {
  get: <T>(url: string, config?: AxiosRequestConfig) =>
    request<T>(http.get<ApiResponse<T>>(url, config)),
  post: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    request<T>(http.post<ApiResponse<T>>(url, data, config)),
  put: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    request<T>(http.put<ApiResponse<T>>(url, data, config)),
  patch: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    request<T>(http.patch<ApiResponse<T>>(url, data, config)),
  delete: <T>(url: string, config?: AxiosRequestConfig) =>
    request<T>(http.delete<ApiResponse<T>>(url, config)),
}
