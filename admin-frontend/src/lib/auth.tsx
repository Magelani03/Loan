import React, { createContext, useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export interface AdminUser {
  id: string
  email: string
  name?: string | null
  role: string
}

interface AuthContextValue {
  user: AdminUser | null
  token: string | null
  login: (user: AdminUser, token: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const savedToken = localStorage.getItem('admin-token')
    const savedUser = localStorage.getItem('admin-user')
    if (savedToken && savedUser) {
      try {
        setToken(savedToken)
        setUser(JSON.parse(savedUser))
      } catch {
        localStorage.removeItem('admin-token')
        localStorage.removeItem('admin-user')
      }
    }
  }, [])

  const login = (u: AdminUser, t: string) => {
    setUser(u)
    setToken(t)
    localStorage.setItem('admin-token', t)
    localStorage.setItem('admin-user', JSON.stringify(u))
    navigate('/loans', { replace: true })
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('admin-token')
    localStorage.removeItem('admin-user')
    navigate('/login', { replace: true })
  }

  return <AuthContext.Provider value={{ user, token, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return ctx
}
