import { useCallback, useEffect, useMemo, useState } from 'react'
import './App.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001'
const CATEGORIES = ['Product', 'Service', 'Support', 'Feature request', 'Other']
const CATEGORY_COLORS = ['#675cf5', '#12b886', '#ff9f43', '#f45b87', '#69a7ff']

const api = async (path, options = {}) => {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  })
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    const error = new Error(payload.message || 'Something went wrong. Please try again.')
    error.fields = payload.errors
    error.status = response.status
    throw error
  }
  return payload
}

function Brand() {
  return (
    <div className="brand" aria-label="Acowale Pulse">
      <span className="brand-mark">a</span>
      <span>acowale</span>
      <span className="brand-product">pulse</span>
    </div>
  )
}

function Header({ page, setPage, authenticated, onLogout }) {
  return (
    <header className="site-header">
      <Brand />
      <nav aria-label="Primary navigation">
        <button className={page === 'feedback' ? 'nav-active' : ''} onClick={() => setPage('feedback')}>
          Share feedback
        </button>
        <button className={page === 'dashboard' ? 'nav-active' : ''} onClick={() => setPage('dashboard')}>
          Dashboard
        </button>
        {authenticated && <button className="logout-link" onClick={onLogout}>Sign out</button>}
      </nav>
    </header>
  )
}

function Stars({ value, onChange }) {
  return (
    <div className="rating-row" role="radiogroup" aria-label="Overall experience rating">
      {[1, 2, 3, 4, 5].map((rating) => (
        <button
          type="button"
          role="radio"
          aria-checked={value === rating}
          aria-label={`${rating} star${rating > 1 ? 's' : ''}`}
          className={rating <= value ? 'star selected' : 'star'}
          onClick={() => onChange(rating)}
          key={rating}
        >
          ★
        </button>
      ))}
      <span>{value ? ['Very poor', 'Poor', 'Okay', 'Good', 'Excellent'][value - 1] : 'Select a rating'}</span>
    </div>
  )
}

function FeedbackForm() {
  const initialForm = { name: '', email: '', category: '', rating: 0, comments: '' }
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle')
  const [message, setMessage] = useState('')

  const update = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
    setMessage('')
  }

  const submit = async (event) => {
    event.preventDefault()
    setStatus('loading')
    setMessage('')
    try {
      const result = await api('/api/feedback', { method: 'POST', body: JSON.stringify(form) })
      setStatus('success')
      setMessage(result.message)
      setForm(initialForm)
      setErrors({})
    } catch (error) {
      setStatus('error')
      setMessage(error.message)
      setErrors(error.fields || {})
    }
  }

  return (
    <main className="feedback-page">
      <section className="feedback-intro">
        <div className="eyebrow"><span /> YOUR VOICE MATTERS</div>
        <h1>Help us build<br /><em>something better.</em></h1>
        <p>Every thoughtful note helps us make Acowale simpler, faster, and more useful for the people who rely on it.</p>
        <div className="promise-list">
          <div><span>01</span><p><strong>Quick to share</strong><br />Less than two minutes</p></div>
          <div><span>02</span><p><strong>Read by humans</strong><br />Every response is reviewed</p></div>
          <div><span>03</span><p><strong>Always private</strong><br />Your details stay protected</p></div>
        </div>
      </section>

      <section className="form-card">
        {status === 'success' ? (
          <div className="success-state" role="status">
            <div className="success-icon">✓</div>
            <p className="eyebrow">FEEDBACK RECEIVED</p>
            <h2>Thank you for<br />making us better.</h2>
            <p>{message}</p>
            <button className="primary-button" onClick={() => { setStatus('idle'); setMessage('') }}>Share another response</button>
          </div>
        ) : (
          <form onSubmit={submit} noValidate>
            <div className="form-heading">
              <div><span className="step-label">FEEDBACK FORM</span><h2>Tell us what you think</h2></div>
              <span className="time-pill">◷ 2 min</span>
            </div>

            <fieldset>
              <legend>What is your feedback about? <b>*</b></legend>
              <div className="category-grid">
                {CATEGORIES.map((category) => (
                  <button
                    type="button"
                    className={form.category === category ? 'category selected' : 'category'}
                    onClick={() => update('category', category)}
                    key={category}
                  >
                    <span>{category === 'Product' ? '◇' : category === 'Service' ? '◎' : category === 'Support' ? '♡' : category === 'Feature request' ? '✦' : '•••'}</span>
                    {category}
                  </button>
                ))}
              </div>
              {errors.category && <small className="field-error">{errors.category}</small>}
            </fieldset>

            <fieldset>
              <legend>How was your overall experience? <b>*</b></legend>
              <Stars value={form.rating} onChange={(rating) => update('rating', rating)} />
              {errors.rating && <small className="field-error">{errors.rating}</small>}
            </fieldset>

            <label className="field-label" htmlFor="comments">Tell us more <b>*</b></label>
            <div className="textarea-wrap">
              <textarea
                id="comments"
                value={form.comments}
                maxLength="1200"
                placeholder="What worked well? What could be better?"
                onChange={(event) => update('comments', event.target.value)}
              />
              <span>{form.comments.length} / 1200</span>
            </div>
            {errors.comments && <small className="field-error">{errors.comments}</small>}

            <div className="identity-row">
              <label>Your name <span>OPTIONAL</span><input value={form.name} onChange={(event) => update('name', event.target.value)} placeholder="e.g. Aisha" /></label>
              <label>Email <span>OPTIONAL</span><input type="email" value={form.email} onChange={(event) => update('email', event.target.value)} placeholder="you@company.com" /></label>
            </div>
            {(errors.name || errors.email) && <small className="field-error">{errors.name || errors.email}</small>}
            {message && status === 'error' && <div className="form-alert" role="alert">{message}</div>}
            <button className="primary-button submit-button" disabled={status === 'loading'}>
              {status === 'loading' ? 'Sending…' : 'Send feedback'} <span>→</span>
            </button>
            <p className="privacy-note">🔒 Your response is securely stored and never shared.</p>
          </form>
        )}
      </section>
    </main>
  )
}

function Login({ onLogin }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    try {
      const result = await api('/api/auth/login', { method: 'POST', body: JSON.stringify({ password }) })
      onLogin(result.data.token)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="login-page">
      <section className="login-card">
        <div className="login-icon">↗</div>
        <span className="step-label">ADMIN CONSOLE</span>
        <h1>Welcome back.</h1>
        <p>Sign in to review feedback and spot the signals hiding in the noise.</p>
        <form onSubmit={submit}>
          <label>Admin password<input autoFocus type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" /></label>
          {error && <div className="form-alert" role="alert">{error}</div>}
          <button className="primary-button" disabled={loading || !password}>{loading ? 'Signing in…' : 'Open dashboard →'}</button>
        </form>
        <small>Use the password configured in the backend environment.</small>
      </section>
    </main>
  )
}

const formatDate = (value) => {
  const date = new Date(value)
  const difference = Date.now() - date.getTime()
  if (difference < 3600000) return `${Math.max(Math.floor(difference / 60000), 1)}m ago`
  if (difference < 86400000) return `${Math.floor(difference / 3600000)}h ago`
  if (difference < 604800000) return `${Math.floor(difference / 86400000)}d ago`
  return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
}

function Dashboard({ token, onUnauthorized }) {
  const [summary, setSummary] = useState(null)
  const [feedback, setFeedback] = useState([])
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })
  const [filters, setFilters] = useState({ q: '', category: 'All', page: 1 })
  const [searchDraft, setSearchDraft] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const authHeaders = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token])

  const loadData = useCallback(async () => {
    setLoading(true)
    setError('')
    const params = new URLSearchParams({ ...filters, limit: '8' })
    try {
      const [summaryResult, feedbackResult] = await Promise.all([
        api('/api/analytics/summary', { headers: authHeaders }),
        api(`/api/feedback?${params}`, { headers: authHeaders }),
      ])
      setSummary(summaryResult.data)
      setFeedback(feedbackResult.data)
      setPagination(feedbackResult.pagination)
    } catch (requestError) {
      if (requestError.status === 401) onUnauthorized()
      else setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }, [authHeaders, filters, onUnauthorized])

  useEffect(() => { loadData() }, [loadData])

  const submitSearch = (event) => {
    event.preventDefault()
    setFilters((current) => ({ ...current, q: searchDraft, page: 1 }))
  }

  const maxCategory = Math.max(...(summary?.categoryDistribution.map((item) => item.count) || [1]), 1)

  return (
    <main className="dashboard-page">
      <div className="dashboard-title">
        <div><span className="step-label">ADMIN CONSOLE</span><h1>Feedback overview</h1><p>Here’s what your customers are telling you.</p></div>
        <button className="refresh-button" onClick={loadData}>↻ Refresh</button>
      </div>

      {error && <div className="form-alert dashboard-alert">{error}</div>}
      <section className="metric-grid" aria-busy={loading}>
        <article><span className="metric-icon violet">↗</span><p>Total feedback</p><strong>{summary?.total ?? '—'}</strong><small>All-time responses</small></article>
        <article><span className="metric-icon green">★</span><p>Average rating</p><strong>{summary?.averageRating ?? '—'}<i>/5</i></strong><small>Across all responses</small></article>
        <article><span className="metric-icon orange">◷</span><p>Last 7 days</p><strong>{summary?.thisWeek ?? '—'}</strong><small>Fresh customer signals</small></article>
        <article className="top-category"><span className="metric-icon pink">◇</span><p>Top category</p><strong>{summary?.categoryDistribution.reduce((best, item) => item.count > best.count ? item : best, { category: '—', count: -1 }).category}</strong><small>Most discussed area</small></article>
      </section>

      <section className="insight-grid">
        <article className="panel distribution-panel">
          <div className="panel-heading"><div><h2>Category distribution</h2><p>What customers talk about most</p></div><span>ALL TIME</span></div>
          <div className="bar-chart">
            {summary?.categoryDistribution.map((item, index) => (
              <div className="bar-row" key={item.category}>
                <span className="bar-label">{item.category}</span>
                <div className="bar-track"><div style={{ width: `${(item.count / maxCategory) * 100}%`, background: CATEGORY_COLORS[index] }} /></div>
                <strong>{item.count}</strong>
              </div>
            ))}
          </div>
        </article>
        <article className="panel pulse-panel">
          <div className="panel-heading"><div><h2>Customer pulse</h2><p>At-a-glance experience score</p></div><span>LIVE</span></div>
          <div className="pulse-score"><strong>{summary?.averageRating ?? 0}</strong><span>/ 5</span></div>
          <div className="large-stars">★★★★★</div>
          <p>Based on {summary?.total ?? 0} customer response{summary?.total === 1 ? '' : 's'}</p>
          <div className="pulse-line"><span style={{ width: `${((summary?.averageRating || 0) / 5) * 100}%` }} /></div>
        </article>
      </section>

      <section className="panel submissions-panel">
        <div className="panel-heading submissions-heading">
          <div><h2>Recent submissions</h2><p>{pagination.total} matching response{pagination.total === 1 ? '' : 's'}</p></div>
          <div className="filters">
            <form onSubmit={submitSearch}><span>⌕</span><input value={searchDraft} onChange={(event) => setSearchDraft(event.target.value)} placeholder="Search feedback…" /></form>
            <select value={filters.category} onChange={(event) => setFilters({ q: filters.q, category: event.target.value, page: 1 })} aria-label="Filter by category">
              <option>All</option>{CATEGORIES.map((category) => <option key={category}>{category}</option>)}
            </select>
          </div>
        </div>

        <div className="table-wrap">
          <table>
            <thead><tr><th>Customer</th><th>Category</th><th>Feedback</th><th>Rating</th><th>Submitted</th></tr></thead>
            <tbody>
              {!loading && feedback.map((item) => (
                <tr key={item.id}>
                  <td><span className="avatar">{item.name.charAt(0).toUpperCase()}</span><div><strong>{item.name}</strong><small>{item.email || 'No email provided'}</small></div></td>
                  <td><span className={`category-tag category-${CATEGORIES.indexOf(item.category)}`}>{item.category}</span></td>
                  <td title={item.comments}>{item.comments}</td>
                  <td><span className="row-stars">{'★'.repeat(item.rating)}<i>{'★'.repeat(5 - item.rating)}</i></span></td>
                  <td>{formatDate(item.createdAt)}</td>
                </tr>
              ))}
              {!loading && feedback.length === 0 && <tr><td colSpan="5" className="empty-row">No feedback matches those filters.</td></tr>}
              {loading && <tr><td colSpan="5" className="empty-row">Loading customer feedback…</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="pagination">
          <span>Page {pagination.page} of {pagination.pages}</span>
          <div><button disabled={pagination.page <= 1} onClick={() => setFilters((current) => ({ ...current, page: current.page - 1 }))}>←</button><button disabled={pagination.page >= pagination.pages} onClick={() => setFilters((current) => ({ ...current, page: current.page + 1 }))}>→</button></div>
        </div>
      </section>
    </main>
  )
}

function App() {
  const [page, setPage] = useState('feedback')
  const [token, setToken] = useState(() => sessionStorage.getItem('acowale_admin_token') || '')

  const login = (newToken) => {
    sessionStorage.setItem('acowale_admin_token', newToken)
    setToken(newToken)
  }
  const logout = useCallback(() => {
    sessionStorage.removeItem('acowale_admin_token')
    setToken('')
  }, [])

  return (
    <div className="app-shell">
      <Header page={page} setPage={setPage} authenticated={Boolean(token)} onLogout={logout} />
      {page === 'feedback' ? <FeedbackForm /> : token ? <Dashboard token={token} onUnauthorized={logout} /> : <Login onLogin={login} />}
      <footer><Brand /><p>Made with care for better customer experiences.</p><span>© {new Date().getFullYear()} Acowale</span></footer>
    </div>
  )
}

export default App
