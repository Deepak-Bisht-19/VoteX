import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchElections } from '../api/elections'

const STATUS_CLASS = {
  upcoming: 'status-upcoming',
  active: 'status-active',
  completed: 'status-completed',
}

export default function Dashboard() {
  const [elections, setElections] = useState([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState(null)

  useEffect(() => {
    fetchElections()
      .then((data) => setElections(Array.isArray(data) ? data : data.elections || []))
      .catch(() => setErr('Could not load elections. Check that your backend is running and reachable.'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="page">
      <div className="page-header">
        <p className="eyebrow">Ballot box</p>
        <h1>Elections</h1>
        <p>Browse open, upcoming, and past elections you're eligible to vote in.</p>
      </div>

      {loading && <div className="loading-state">Loading elections…</div>}
      {err && <div className="form-error">{err}</div>}

      {!loading && !err && elections.length === 0 && (
        <div className="empty-state">
          <h3>No elections yet</h3>
          <p>Check back once an administrator schedules one.</p>
        </div>
      )}

      {elections.map((election) => (
        <Link key={election._id} to={`/elections/${election._id}`} className="card election-card">
          <div>
            <h3>{election.title}</h3>
            <div className="meta">
              {election.position} · {election.electionLevel}
              {election.location?.district ? ` · ${election.location.district}, ${election.location.state}` : election.location?.state ? ` · ${election.location.state}` : ''}
            </div>
          </div>
          <span className={`status-pill ${STATUS_CLASS[election.status] || 'status-upcoming'}`}>
            {election.status || 'upcoming'}
          </span>
        </Link>
      ))}
    </div>
  )
}
