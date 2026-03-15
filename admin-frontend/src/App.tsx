import { Routes, Route, Navigate } from 'react-router-dom'
import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'
import { LoansListPage } from './pages/LoansListPage'
import { LoanDetailPage } from './pages/LoanDetailPage'
import { AdminLayout } from './components/AdminLayout'
import { useAuth } from './lib/auth'

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { user, token } = useAuth()
  if (!token || !user || (user.role ?? '').toLowerCase() !== 'admin') {
    return <Navigate to="/login" replace />
  }
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="loans" element={<LoansListPage />} />
        <Route path="loans/:id" element={<LoanDetailPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
