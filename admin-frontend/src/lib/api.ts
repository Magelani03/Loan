// Base URL for the API. In production, set VITE_API_BASE to your Render backend URL,
// e.g. "https://your-backend.onrender.com/api". Falls back to relative /api for local dev.
// Cast import.meta as any so this file doesn't depend on Vite's type declarations being present.
const API_BASE = ((import.meta as any).env?.VITE_API_BASE as string | undefined) || '/api'

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
    throw new Error(text || res.statusText)
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
