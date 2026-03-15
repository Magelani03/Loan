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
      const role = (res.user?.role ?? '').toLowerCase()
      if (!res.user || role !== 'admin') {
        setError('This user is not an admin.')
        return
      }
      login(res.user, res.token)
      navigate('/', { replace: true })
    } catch (err: any) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin-login-wrap">
      <form onSubmit={handleSubmit} className="admin-login-card">
        <h1>Admin Login</h1>
        {error && <div className="admin-error">{error}</div>}
        <div className="admin-form-group">
          <label className="admin-label">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="admin-search-input"
            style={{ maxWidth: 'none' }}
          />
        </div>
        <div className="admin-form-group">
          <label className="admin-label">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="admin-search-input"
            style={{ maxWidth: 'none' }}
          />
        </div>
        <button type="submit" disabled={loading} className="admin-button">
          {loading ? 'Logging in…' : 'Login'}
        </button>
      </form>
    </div>
  )
}
