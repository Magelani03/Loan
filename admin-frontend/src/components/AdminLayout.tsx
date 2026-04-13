import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'

export function AdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand admin-sidebar-brand--logo">
          <img
            src="/aunty-d-logo.png"
            alt="AUNTY D"
            className="admin-sidebar-logo-img"
          />
          <span className="admin-sidebar-logo-sub">Admin</span>
        </div>
        <nav className="admin-sidebar-nav">
          <NavLink
            to="/"
            end
            className={({ isActive }) => `admin-sidebar-link ${isActive ? 'admin-sidebar-link--active' : ''}`}
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/loans"
            className={({ isActive }) => `admin-sidebar-link ${isActive ? 'admin-sidebar-link--active' : ''}`}
          >
            Loans
          </NavLink>
        </nav>
        <div className="admin-sidebar-footer">
          <div className="admin-sidebar-user">
            <span className="admin-sidebar-user-email">{user?.email ?? 'Admin'}</span>
          </div>
          <button type="button" onClick={handleLogout} className="admin-sidebar-logout">
            Logout
          </button>
        </div>
      </aside>
      <main className="admin-main">
        <div className="admin-main-inner">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
