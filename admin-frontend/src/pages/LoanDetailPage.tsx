import { FormEvent, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { get, post, documentUrl } from '../lib/api'

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
  status: string
  dateApplied: string
  messages: { at?: string; status?: string; message?: string }[] | null
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

const statusLabels: Record<string, string> = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
  money_sent: 'Money Sent',
  payback_ongoing: 'Payback Ongoing',
  complete: 'Complete',
}

const STATUS_FLOW = ['pending', 'approved', 'money_sent', 'payback_ongoing', 'complete'] as const

export function LoanDetailPage() {
  const { id } = useParams<{ id: string }>()
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
      } catch {
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
    } catch {
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
    } catch {
      setError('Failed to update loan status. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading && !loan) {
    return (
      <div className="admin-page">
        <div className="admin-loading">Loading loan…</div>
      </div>
    )
  }

  if (error && !loan) {
    return (
      <div className="admin-page">
        <div className="admin-error">{error}</div>
        <Link to="/loans" className="admin-link">← Back to loans</Link>
      </div>
    )
  }

  if (!loan) {
    return (
      <div className="admin-page">
        <p>Loan not found.</p>
        <Link to="/loans" className="admin-link">← Back to loans</Link>
      </div>
    )
  }

  const user = loan.user
  const documents = user?.documents ?? []
  const guarantors = user?.guarantors ?? []
  const currentStepIndex = STATUS_FLOW.indexOf(loan.status as typeof STATUS_FLOW[number])
  const isRejected = loan.status === 'rejected'

  return (
    <div className="admin-page admin-detail">
      <div className="admin-detail-back">
        <Link to="/loans" className="admin-link">← Back to loans</Link>
      </div>

      <header className="admin-page-header admin-detail-header">
        <div>
          <h1>Loan {loan.referenceNumber}</h1>
          <p className="admin-page-subtitle">Applied {new Date(loan.dateApplied).toLocaleDateString()}</p>
        </div>
        <span className={`admin-badge admin-badge--${loan.status.replace('_', '-')} admin-badge--lg`}>
          {statusLabels[loan.status] ?? loan.status}
        </span>
      </header>

      {error && <div className="admin-error">{error}</div>}

      {/* Status stepper */}
      {!isRejected && (
        <section className="admin-card admin-section">
          <h2 className="admin-section-title">Status progress</h2>
          <div className="admin-stepper">
            {STATUS_FLOW.map((step, idx) => {
              const done = currentStepIndex > idx || loan.status === step
              return (
                <div
                  key={step}
                  className={`admin-stepper-item ${done ? 'admin-stepper-item--done' : ''} ${loan.status === step ? 'admin-stepper-item--current' : ''}`}
                >
                  <span className="admin-stepper-dot" />
                  <span className="admin-stepper-label">{statusLabels[step] ?? step}</span>
                  {idx < STATUS_FLOW.length - 1 && <span className="admin-stepper-line" />}
                </div>
              )
            })}
          </div>
        </section>
      )}

      <div className="admin-detail-grid">
        <section className="admin-card admin-section">
          <h2 className="admin-section-title">Applicant</h2>
          {user ? (
            <div className="admin-detail-list">
              <p><strong>{user.name} {user.surname}</strong></p>
              <p><a href={`mailto:${user.email}`} className="admin-link">{user.email}</a></p>
              {user.telephone && <p>{user.telephone}</p>}
            </div>
          ) : (
            <p>Applicant details not available.</p>
          )}
        </section>

        <section className="admin-card admin-section">
          <h2 className="admin-section-title">Loan details</h2>
          <div className="admin-detail-list">
            <p><strong>Amount:</strong> N${loan.amount.toLocaleString('en-GB', { minimumFractionDigits: 2 })}</p>
            <p><strong>Interest rate:</strong> {loan.interestRate}%</p>
            <p><strong>Repayment period:</strong> {loan.repaymentPeriod} months</p>
          </div>
        </section>
      </div>

      <section className="admin-card admin-section">
        <h2 className="admin-section-title">Documents</h2>
        {documents.length === 0 ? (
          <p className="admin-muted">No documents uploaded.</p>
        ) : (
          <div className="admin-doc-list">
            {documents.map((doc) => (
              <a
                key={doc.id}
                href={documentUrl(doc.url)}
                target="_blank"
                rel="noreferrer"
                className="admin-doc-link"
              >
                {doc.type} — View
              </a>
            ))}
          </div>
        )}
      </section>

      <section className="admin-card admin-section">
        <h2 className="admin-section-title">Guarantors</h2>
        {guarantors.length === 0 ? (
          <p className="admin-muted">No guarantors.</p>
        ) : (
          <ul className="admin-detail-list">
            {guarantors.map((g) => (
              <li key={g.id}>{g.name} — {g.contact}</li>
            ))}
          </ul>
        )}
      </section>

      <section className="admin-card admin-section">
        <h2 className="admin-section-title">Activity log</h2>
        {(!loan.messages || loan.messages.length === 0) ? (
          <p className="admin-muted">No activity yet.</p>
        ) : (
          <ul className="admin-activity-list">
            {loan.messages.map((m, idx) => (
              <li key={idx} className="admin-activity-item">
                <span className="admin-activity-meta">
                  {m.at ? new Date(m.at).toLocaleString() : '—'} · {m.status ?? 'note'}
                </span>
                {(m.message || (m as any).message) && (
                  <div className="admin-activity-body">{(m.message ?? (m as any).message) as string}</div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="admin-card admin-section">
        <h2 className="admin-section-title">Decision & status</h2>
        <form onSubmit={(e: FormEvent) => e.preventDefault()}>
          <div className="admin-form-group">
            <label className="admin-label">Message (optional)</label>
            <textarea
              value={decisionMessage}
              onChange={(e) => setDecisionMessage(e.target.value)}
              rows={3}
              className="admin-textarea"
              placeholder="Add a note for this action…"
            />
          </div>
          <div className="admin-actions">
            <button
              type="button"
              onClick={() => handleDecision('approved')}
              disabled={submitting || loan.status !== 'pending'}
              className="admin-btn admin-btn--success"
            >
              Approve
            </button>
            <button
              type="button"
              onClick={() => handleDecision('rejected')}
              disabled={submitting || loan.status !== 'pending'}
              className="admin-btn admin-btn--danger"
            >
              Reject
            </button>
          </div>
          <div className="admin-actions admin-actions--secondary">
            <button
              type="button"
              onClick={() => handleStatusUpdate('money-sent')}
              disabled={submitting || loan.status !== 'approved'}
              className="admin-btn"
            >
              Mark money sent
            </button>
            <button
              type="button"
              onClick={() => handleStatusUpdate('payback-ongoing')}
              disabled={submitting || !['money_sent', 'approved'].includes(loan.status)}
              className="admin-btn"
            >
              Mark payback ongoing
            </button>
            <button
              type="button"
              onClick={() => handleStatusUpdate('complete')}
              disabled={submitting || !['payback_ongoing', 'money_sent', 'approved'].includes(loan.status)}
              className="admin-btn"
            >
              Mark complete
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
