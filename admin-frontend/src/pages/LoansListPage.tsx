import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { get } from '../lib/api'
import { useAuth } from '../lib/auth'

interface LoanListItem {
  id: string
  referenceNumber: string
  amount: number
  status: string // raw status from backend: 'pending' | 'approved' | 'rejected' | 'money_sent' | 'payback_ongoing' | 'complete'
  dateApplied: string
  user: {
    id: string
    name: string | null
    surname: string | null
    email: string
    telephone: string | null
  }
}

type StatusFilter = 'pending' | 'approved' | 'rejected' | 'all'

const statusLabels: Record<string, string> = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
  money_sent: 'Money Sent',
  payback_ongoing: 'Payback Ongoing',
  complete: 'Complete',
};

export function LoansListPage() {
  const { logout } = useAuth()
  const [status, setStatus] = useState<StatusFilter>('pending')
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
      } catch (err: any) {
        console.error('Failed to load loans', err)
        setError('Failed to load loans. Please try again later.')
      } finally {
        setLoading(false)
      }
    }
    fetchLoans()
  }, [status])

  return (
    <div className="admin-shell">
      <div className="admin-shell-inner">
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700 }}>Loan Applications</h1>
          <button onClick={logout} className="admin-button">
            Logout
          </button>
        </header>

        <div style={{ marginBottom: 16, display: 'flex', flexWrap: 'wrap' }}>
        {(['pending', 'approved', 'rejected', 'all'] as StatusFilter[]).map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            style={{
              marginRight: 8,
              padding: '6px 12px',
              background: status === s ? '#333' : '#eee',
              color: status === s ? '#fff' : '#000',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
            }}
          >
            {s[0].toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

        {loading && <p>Loading...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}

        <div className="admin-card" style={{ padding: 16 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ borderBottom: '1px solid #ccc', textAlign: 'left', padding: 8 }}>Reference</th>
            <th style={{ borderBottom: '1px solid #ccc', textAlign: 'left', padding: 8 }}>Applicant</th>
            <th style={{ borderBottom: '1px solid #ccc', textAlign: 'left', padding: 8 }}>Amount</th>
            <th style={{ borderBottom: '1px solid #ccc', textAlign: 'left', padding: 8 }}>Status</th>
            <th style={{ borderBottom: '1px solid #ccc', textAlign: 'left', padding: 8 }}>Date</th>
            <th style={{ borderBottom: '1px solid #ccc', textAlign: 'left', padding: 8 }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {loans.map((loan) => (
            <tr key={loan.id}>
              <td style={{ borderBottom: '1px solid #eee', padding: 8 }}>{loan.referenceNumber}</td>
              <td style={{ borderBottom: '1px solid #eee', padding: 8 }}>
                {loan.user.name} {loan.user.surname}
                <div style={{ fontSize: 12, color: '#555' }}>{loan.user.email}</div>
              </td>
              <td style={{ borderBottom: '1px solid #eee', padding: 8 }}>{loan.amount.toFixed(2)}</td>
              <td style={{ borderBottom: '1px solid #eee', padding: 8 }}>
                {statusLabels[loan.status] ?? loan.status}
              </td>
              <td style={{ borderBottom: '1px solid #eee', padding: 8 }}>
                {new Date(loan.dateApplied).toLocaleDateString()}
              </td>
              <td style={{ borderBottom: '1px solid #eee', padding: 8 }}>
                <Link to={`/loans/${loan.id}`}>View</Link>
              </td>
            </tr>
          ))}
          {loans.length === 0 && !loading && (
            <tr>
              <td colSpan={6} style={{ padding: 16, textAlign: 'center' }}>
                No loans found.
              </td>
            </tr>
          )}
        </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
