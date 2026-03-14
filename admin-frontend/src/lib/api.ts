// Base URL for the API. Set VITE_API_BASE to your backend URL, e.g. "https://loan-backend-oyhr.onrender.com/api"
// (use https:// with two slashes). Paths like /auth/login are appended automatically.
const raw = ((import.meta as any).env?.VITE_API_BASE as string | undefined) || '/api'
const normalized = raw.startsWith('http') && raw.includes('/api')
  ? raw.replace(/(\/api).*$/, '$1')
  : raw
const API_BASE =
  normalized.startsWith('http') && !normalized.endsWith('/api')
    ? `${normalized.replace(/\/$/, '')}/api`
    : normalized

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('admin-token')

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> | undefined),
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  })

  if (!res.ok) {
    const text = await res.text()
    let message = text || res.statusText
    try {
      const json = JSON.parse(text)
      if (json?.error) message = json.error
    } catch {
      /* use text as message */
    }
    throw new Error(message)
  }

  return res.json()
}

export function get<T>(path: string): Promise<T> {
  return request<T>(path, { method: 'GET' })
}

export function post<T>(path: string, body: any): Promise<T> {
  return request<T>(path, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
}
