const tokenKey = 'radar-cambial-token'

export function getToken() {
  return window.localStorage.getItem(tokenKey)
}

export function saveToken(token: string) {
  window.localStorage.setItem(tokenKey, token)
}

export function clearToken() {
  window.localStorage.removeItem(tokenKey)
}

export async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers)
  headers.set('Content-Type', 'application/json')
  const token = getToken()
  if (token) headers.set('Authorization', `Bearer ${token}`)

  const response = await fetch(url, { ...options, headers })
  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new Error(body.message || 'Não foi possível concluir a operação.')
  }

  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}
