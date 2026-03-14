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

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'money_sent', label: 'Money Sent' },
  { value: 'payback_ongoing', label: 'Payback Ongoing' },
  { value: 'complete', label: 'Complete' },
  { value: 'all', label: 'All' },
] as const

type StatusFilter = typeof STATUS_OPTIONS[number]['value']

const statusLabels: Record<string, string> = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
  money_sent: 'Money Sent',
  payback_ongoing: 'Payback Ongoing',
  complete: 'Complete',
}

export function LoansListPage() {
  const [status, setStatus] = useState<StatusFilter>('all')
  const [search, setSearch] = useState('')
  const [loans, setLoans] = useState<LoanListItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchLoans = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await get<LoanListItem[]>(`/admin/loans?status=${status}`)
        setLoans(data)
      } catch (err: unknown) {
        setError('Failed to load loans. Please try again later.')
      } finally {
        setLoading(false)
      }
    }
    fetchLoans()
  }, [status])

  const filteredLoans = useMemo(() => {
    if (!search.trim()) return loans
    const q = search.trim().toLowerCase()
    return loans.filter(
      (loan) =>
        loan.referenceNumber.toLowerCase().includes(q) ||
        loan.user.email.toLowerCase().includes(q) ||
        (loan.user.name?.toLowerCase().includes(q)) ||
        (loan.user.surname?.toLowerCase().includes(q)) ||
        `${loan.user.name ?? ''} ${loan.user.surname ?? ''}`.toLowerCase().includes(q)
    )
  }, [loans, search])

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <h1>Loan applications</h1>
        <p className="admin-page-subtitle">Review and manage applications by status</p>
      </header>

      <div className="admin-toolbar">
        <div className="admin-filter-group">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setStatus(opt.value)}
              className={`admin-filter-btn ${status === opt.value ? 'admin-filter-btn--active' : ''}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <div className="admin-search-wrap">
          <input
            type="search"
            placeholder="Search by reference, name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="admin-search-input"
          />
        </div>
      </div>

      {error && <div className="admin-error">{error}</div>}
      {loading && <div className="admin-loading">Loading…</div>}

      {!loading && (
        <div className="admin-card admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Reference</th>
                <th>Applicant</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLoans.map((loan) => (
                <tr key={loan.id}>
                  <td>
                    <code className="admin-ref">{loan.referenceNumber}</code>
                  </td>
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
          {filteredLoans.length === 0 && (
            <div className="admin-empty">
              {loans.length === 0 ? 'No loans found for this status.' : 'No matches for your search.'}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
