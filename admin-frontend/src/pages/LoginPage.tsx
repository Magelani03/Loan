import { FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { post } from '../lib/api'
import { useAuth, AdminUser } from '../lib/auth'

interface LoginResponse {
  token: string
  user: AdminUser
}

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await post<LoginResponse>('/auth/login', { email, password })
      if (!res.user || res.user.role !== 'admin') {
        setError('This user is not an admin.')
        return
      }
      login(res.user, res.token)
      navigate('/loans', { replace: true })
    } catch (err: any) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <form onSubmit={handleSubmit} style={{ width: 320, padding: 24, border: '1px solid #ddd', borderRadius: 8 }}>
        <h1 style={{ marginBottom: 16 }}>Admin Login</h1>
        {error && (
          <div style={{ marginBottom: 12, color: 'red', fontSize: 14 }}>
            {error}
          </div>
        )}
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: 'block', marginBottom: 4 }}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: 8 }}
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 4 }}>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: 8 }}
          />
        </div>
        <button type="submit" disabled={loading} style={{ width: '100%', padding: 10 }}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  )
}
