import { FormEvent, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { get, post } from '../lib/api'
import { useAuth } from '../lib/auth'

interface Document {
  id: string
  type: string
  url: string
}

interface Guarantor {
  id: string
  name: string
  contact: string
}

interface LoanDetail {
  id: string
  referenceNumber: string
  amount: number
  interestRate: number
  repaymentPeriod: number
  status: string // raw status from backend: 'pending' | 'approved' | 'rejected' | 'money_sent' | 'payback_ongoing' | 'complete'
  dateApplied: string
  messages: any[] | null
  user: {
    id: string
    name: string | null
    surname: string | null
    email: string
    telephone: string | null
    documents: Document[]
    guarantors: Guarantor[]
  }
}

export function LoanDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { logout } = useAuth()

  const statusLabels: Record<string, string> = {
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected',
    money_sent: 'Money Sent',
    payback_ongoing: 'Payback Ongoing',
    complete: 'Complete',
  }
  const navigate = useNavigate()
  const [loan, setLoan] = useState<LoanDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [decisionMessage, setDecisionMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const fetchLoan = async () => {
      if (!id) return
      setLoading(true)
      setError(null)
    try {
      const data = await get<LoanDetail>(`/admin/loans/${id}`)
      setLoan(data)
    } catch (err: any) {
      console.error('Failed to load loan', err)
      setError('Failed to load loan. Please try again later.')
    } finally {
        setLoading(false)
      }
    }
    fetchLoan()
  }, [id])

  const handleDecision = async (status: 'approved' | 'rejected') => {
    if (!id) return
    setSubmitting(true)
    setError(null)
    try {
      const updated = await post<LoanDetail>(`/admin/loans/${id}/decision`, {
        status,
        message: decisionMessage || undefined,
      })
      setLoan(updated)
      setDecisionMessage('')
    } catch (err: any) {
      console.error('Failed to submit decision', err)
      setError('Failed to submit decision. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleStatusUpdate = async (action: 'money-sent' | 'payback-ongoing' | 'complete') => {
    if (!id) return
    setSubmitting(true)
    setError(null)
    try {
      const updated = await post<LoanDetail>(`/admin/loans/${id}/${action}`, {
        message: decisionMessage || undefined,
      })
      setLoan(updated)
      setDecisionMessage('')
    } catch (err: any) {
      console.error('Failed to update loan status', err)
      setError('Failed to update loan status. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading && !loan) {
    return <p style={{ padding: 24 }}>Loading...</p>
  }

  if (error && !loan) {
    return (
      <div style={{ padding: 24 }}>
        <p style={{ color: 'red' }}>{error}</p>
        <Link to="/loans">Back to list</Link>
      </div>
    )
  }

  if (!loan) {
    return (
      <div style={{ padding: 24 }}>
        <p>Loan not found.</p>
        <Link to="/loans">Back to list</Link>
      </div>
    )
  }

  const user = loan.user;
  const documents = user?.documents ?? [];
  const guarantors = user?.guarantors ?? [];

  return (
    <div className="admin-shell">
      <div className="admin-shell-inner" style={{ maxWidth: 900 }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <button onClick={() => navigate('/loans')} className="admin-button">
            d Back to list
          </button>
          <button onClick={logout} className="admin-button">
            Logout
          </button>
        </header>

        <div className="admin-card" style={{ padding: 20, marginBottom: 24 }}>
          <h1 style={{ marginBottom: 8, fontSize: 22, fontWeight: 700 }}>Loan {loan.referenceNumber}</h1>
          <p style={{ marginBottom: 8 }}>
            <strong>Status:</strong> {statusLabels[loan.status] ?? loan.status}
          </p>
          {error && <p style={{ color: 'red', margin: 0 }}>{error}</p>}
        </div>

      <section className="admin-card" style={{ marginBottom: 24, padding: 20 }}>
        <h2>Applicant</h2>
        {user ? (
          <>
            <p>
              {user.name} {user.surname}
            </p>
            <p>{user.email}</p>
            {user.telephone && <p>{user.telephone}</p>}
          </>
        ) : (
          <p>Applicant details not available.</p>
        )}
      </section>

      <section className="admin-card" style={{ marginBottom: 24, padding: 20 }}>
        <h2>Loan Details</h2>
        <p>Amount: {loan.amount.toFixed(2)}</p>
        <p>Interest rate: {loan.interestRate}%</p>
        <p>Repayment period: {loan.repaymentPeriod} months</p>
        <p>Date applied: {new Date(loan.dateApplied).toLocaleDateString()}</p>
      </section>

      <section className="admin-card" style={{ marginBottom: 24, padding: 20 }}>
        <h2>Documents</h2>
        {documents.length === 0 && <p>No documents uploaded.</p>}
        <ul>
          {documents.map((doc) => (
            <li key={doc.id}>
              {doc.type}: <a href={doc.url} target="_blank" rel="noreferrer">View</a>
            </li>
          ))}
        </ul>
      </section>

      <section className="admin-card" style={{ marginBottom: 24, padding: 20 }}>
        <h2>Guarantors</h2>
        {guarantors.length === 0 && <p>No guarantors.</p>}
        <ul>
          {guarantors.map((g) => (
            <li key={g.id}>
              {g.name} - {g.contact}
            </li>
          ))}
        </ul>
      </section>

      <section className="admin-card" style={{ marginBottom: 24, padding: 20 }}>
        <h2>Messages</h2>
        {(!loan.messages || loan.messages.length === 0) && <p>No messages.</p>}
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {loan.messages &&
            loan.messages.map((m: any, idx) => (
              <li
                key={idx}
                style={{
                  padding: '8px 10px',
                  borderRadius: 8,
                  background: 'rgba(15,23,42,0.25)',
                  marginTop: idx === 0 ? 8 : 4,
                  fontSize: 13,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ opacity: 0.8 }}>
                    {m.at ? new Date(m.at).toLocaleString() : 'Unknown time'}
                  </span>
                  <span style={{ fontWeight: 600 }}>
                    {m.status ?? 'note'}
                  </span>
                </div>
                {m.message && <div>{m.message}</div>}
                {!m.message && <div style={{ opacity: 0.85 }}>{JSON.stringify(m)}</div>}
              </li>
            ))}
        </ul>
      </section>

      <section className="admin-card" style={{ padding: 20 }}>
        <h2>Decision & Status</h2>
        <form
          onSubmit={(e: FormEvent) => {
            e.preventDefault()
          }}
        >
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', marginBottom: 4 }}>Message (optional)</label>
            <textarea
              value={decisionMessage}
              onChange={(e) => setDecisionMessage(e.target.value)}
              rows={3}
              style={{ width: '100%', padding: 8 }}
            />
          </div>
          {/* Initial decision buttons */}
          <div style={{ marginBottom: 12 }}>
            <button
              type="button"
              onClick={() => handleDecision('approved')}
              disabled={submitting || loan.status !== 'pending'}
              style={{ marginRight: 8, padding: '6px 12px' }}
            >
              Approve
            </button>
            <button
              type="button"
              onClick={() => handleDecision('rejected')}
              disabled={submitting || loan.status !== 'pending'}
              style={{ padding: '6px 12px' }}
            >
              Reject
            </button>
          </div>

          {/* Lifecycle buttons after approval */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            <button
              type="button"
              onClick={() => handleStatusUpdate('money-sent')}
              disabled={submitting || loan.status !== 'approved'}
              style={{ padding: '6px 12px' }}
            >
              Mark Money Sent
            </button>
            <button
              type="button"
              onClick={() => handleStatusUpdate('payback-ongoing')}
              disabled={submitting || !['money_sent', 'approved'].includes(loan.status)}
              style={{ padding: '6px 12px' }}
            >
              Mark Payback Ongoing
            </button>
            <button
              type="button"
              onClick={() => handleStatusUpdate('complete')}
              disabled={submitting || !['payback_ongoing', 'money_sent', 'approved'].includes(loan.status)}
              style={{ padding: '6px 12px' }}
            >
              Mark Complete
            </button>
          </div>
        </form>
      </section>
      </div>
    </div>
  )
}
