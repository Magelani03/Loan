import { Routes, Route, Navigate } from 'react-router-dom'
import { LoginPage } from './pages/LoginPage'
import { LoansListPage } from './pages/LoansListPage'
import { LoanDetailPage } from './pages/LoanDetailPage'
import { useAuth } from './lib/auth'

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { user, token } = useAuth()
  if (!token || !user || user.role !== 'admin') {
    return <Navigate to="/login" replace />
  }
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/loans"
        element={
          <ProtectedRoute>
            <LoansListPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/loans/:id"
        element={
          <ProtectedRoute>
            <LoanDetailPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/loans" replace />} />
    </Routes>
  )
}
