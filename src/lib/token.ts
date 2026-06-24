// Armazenamento do JWT da sessão. Mantido em localStorage para sobreviver a
// recarregamentos; o contexto de auth reidrata a sessão a partir daqui.

const TOKEN_KEY = 'rc.token'

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}
