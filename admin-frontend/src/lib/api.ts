// Base URL for the API. In production, set VITE_API_BASE to your backend URL including /api,
// e.g. "https://loan-backend-oyhr.onrender.com/api". Falls back to relative /api for local dev.
const raw = ((import.meta as any).env?.VITE_API_BASE as string | undefined) || '/api'
const API_BASE = raw.startsWith('http') && !raw.endsWith('/api') ? `${raw.replace(/\/$/, '')}/api` : raw

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
