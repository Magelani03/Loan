import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { get } from '../lib/api'

interface LoanListItem {
  id: string
  referenceNumber: string
  amount: number
  status: string
  dateApplied: string
  user: {
    id: string
    name: string | null
    surname: string | null
    email: string
    telephone: string | null
  }
}

const statusLabels: Record<string, string> = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
  money_sent: 'Money Sent',
  payback_ongoing: 'Payback Ongoing',
  complete: 'Complete',
}

const STATUS_ORDER = ['pending', 'approved', 'money_sent', 'payback_ongoing', 'complete', 'rejected']

export function DashboardPage() {
  const [loans, setLoans] = useState<LoanListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchLoans = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await get<LoanListItem[]>('/admin/loans?status=all')
        setLoans(data)
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard.')
      } finally {
        setLoading(false)
      }
    }
    fetchLoans()
  }, [])

  const {
    byStatus,
    totalPendingAmount,
    totalApprovedAmount,
    recentLoans,
    totalLoans,
    pendingCount,
    maxCount,
    uniqueClients,
    completedCount,
    completedAmount,
    applicationsByMonth,
    maxApplicationsInMonth,
  } = useMemo(() => {
    const byStatus: Record<string, number> = {}
    let totalPendingAmount = 0
    let totalApprovedAmount = 0
    let completedAmount = 0
    const clientIds = new Set<string>()
    for (const loan of loans) {
      byStatus[loan.status] = (byStatus[loan.status] ?? 0) + 1
      clientIds.add(loan.user.id)
      if (loan.status === 'pending') totalPendingAmount += loan.amount
      if (['approved', 'money_sent', 'payback_ongoing', 'complete'].includes(loan.status)) {
        totalApprovedAmount += loan.amount
      }
      if (loan.status === 'complete') completedAmount += loan.amount
    }
    const sorted = [...loans].sort((a, b) => new Date(b.dateApplied).getTime() - new Date(a.dateApplied).getTime())
    const recentLoans = sorted.slice(0, 5)
    const totalLoans = loans.length
    const pendingCount = byStatus.pending ?? 0
    const completedCount = byStatus.complete ?? 0
    const maxCount = Math.max(1, ...Object.values(byStatus))

    const now = new Date()
    const months: { label: string; count: number; year: number; month: number }[] = []
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      months.push({
        label: d.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' }),
        year: d.getFullYear(),
        month: d.getMonth(),
        count: 0,
      })
    }
    for (const loan of loans) {
      const d = new Date(loan.dateApplied)
      const m = months.find((x) => x.year === d.getFullYear() && x.month === d.getMonth())
      if (m) m.count += 1
    }
    const maxApplicationsInMonth = Math.max(1, ...months.map((m) => m.count))

    return {
      byStatus,
      totalPendingAmount,
      totalApprovedAmount,
      recentLoans,
      totalLoans,
      pendingCount,
      maxCount,
      uniqueClients: clientIds.size,
      completedCount,
      completedAmount,
      applicationsByMonth: months,
      maxApplicationsInMonth,
    }
  }, [loans])

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-loading">Loading dashboard…</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="admin-page">
        <div className="admin-error">{error}</div>
      </div>
    )
  }

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <h1>Dashboard</h1>
        <p className="admin-page-subtitle">Business statistics and loan activity</p>
      </header>

      <section className="admin-stats-grid">
        <div className="admin-stat-card admin-stat-card--primary">
          <span className="admin-stat-label">Clients</span>
          <span className="admin-stat-value">{uniqueClients}</span>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-label">Total applications</span>
          <span className="admin-stat-value">{totalLoans}</span>
        </div>
        <div className="admin-stat-card admin-stat-card--warning">
          <span className="admin-stat-label">Pending review</span>
          <span className="admin-stat-value">{pendingCount}</span>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-label">Completed loans</span>
          <span className="admin-stat-value">{completedCount}</span>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-label">Pending amount (N$)</span>
          <span className="admin-stat-value">N${totalPendingAmount.toLocaleString('en-GB', { minimumFractionDigits: 2 })}</span>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-label">Disbursed / outstanding (N$)</span>
          <span className="admin-stat-value">N${totalApprovedAmount.toLocaleString('en-GB', { minimumFractionDigits: 2 })}</span>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-label">Repaid (completed) (N$)</span>
          <span className="admin-stat-value">N${completedAmount.toLocaleString('en-GB', { minimumFractionDigits: 2 })}</span>
        </div>
      </section>

      <section className="admin-dashboard-section">
        <h2>Applications over time (last 12 months)</h2>
        <div className="admin-chart-monthly">
          {applicationsByMonth.map((month) => (
            <div key={month.label} className="admin-chart-monthly-col">
              <div
                className="admin-chart-monthly-bar"
                style={{ height: `${(month.count / maxApplicationsInMonth) * 100}%` }}
                title={`${month.label}: ${month.count}`}
              />
              <span className="admin-chart-monthly-label">{month.label}</span>
              <span className="admin-chart-monthly-value">{month.count}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="admin-dashboard-section">
        <h2>Applications by status</h2>
        <div className="admin-chart-bar-wrap">
          {STATUS_ORDER.filter((s) => (byStatus[s] ?? 0) > 0).map((status) => (
            <div key={status} className="admin-chart-bar-row">
              <span className="admin-chart-bar-label">{statusLabels[status] ?? status}</span>
              <div className="admin-chart-bar-track">
                <div
                  className={`admin-chart-bar-fill admin-chart-bar-fill--${status.replace('_', '-')}`}
                  style={{ width: `${((byStatus[status] ?? 0) / maxCount) * 100}%` }}
                />
              </div>
              <span className="admin-chart-bar-value">{byStatus[status] ?? 0}</span>
            </div>
          ))}
        </div>
        {totalLoans === 0 && <p className="admin-muted">No applications yet.</p>}
      </section>

      <section className="admin-dashboard-section">
        <h2>Amounts overview</h2>
        <div className="admin-chart-amounts">
          <div className="admin-chart-amount-block">
            <span className="admin-chart-amount-label">Pending (N$)</span>
            <div className="admin-chart-amount-bar-wrap">
              <div
                className="admin-chart-amount-bar admin-chart-amount-bar--pending"
                style={{
                  width: `${totalPendingAmount + totalApprovedAmount > 0 ? (totalPendingAmount / (totalPendingAmount + totalApprovedAmount)) * 100 : 0}%`,
                }}
              />
            </div>
            <span className="admin-chart-amount-value">N${totalPendingAmount.toLocaleString('en-GB', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="admin-chart-amount-block">
            <span className="admin-chart-amount-label">Approved / disbursed (N$)</span>
            <div className="admin-chart-amount-bar-wrap">
              <div
                className="admin-chart-amount-bar admin-chart-amount-bar--approved"
                style={{
                  width: `${totalPendingAmount + totalApprovedAmount > 0 ? (totalApprovedAmount / (totalPendingAmount + totalApprovedAmount)) * 100 : 0}%`,
                }}
              />
            </div>
            <span className="admin-chart-amount-value">N${totalApprovedAmount.toLocaleString('en-GB', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>
      </section>

      <section className="admin-dashboard-section">
        <div className="admin-dashboard-section-head">
          <h2>Recent applications</h2>
          <Link to="/loans" className="admin-link">View all</Link>
        </div>
        <div className="admin-card admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Reference</th>
                <th>Applicant</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {recentLoans.map((loan) => (
                <tr key={loan.id}>
                  <td>{loan.referenceNumber}</td>
                  <td>
                    <div className="admin-applicant-cell">
                      {loan.user.name} {loan.user.surname}
                      <span className="admin-applicant-email">{loan.user.email}</span>
                    </div>
                  </td>
                  <td>N${loan.amount.toLocaleString('en-GB', { minimumFractionDigits: 2 })}</td>
                  <td>
                    <span className={`admin-badge admin-badge--${loan.status.replace('_', '-')}`}>
                      {statusLabels[loan.status] ?? loan.status}
                    </span>
                  </td>
                  <td>{new Date(loan.dateApplied).toLocaleDateString()}</td>
                  <td>
                    <Link to={`/loans/${loan.id}`} className="admin-link">View</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {recentLoans.length === 0 && <p className="admin-empty">No applications yet.</p>}
        </div>
      </section>
    </div>
  )
}
