import { useEffect, useState } from 'react'
import { fetchElectionHistory } from '../api/elections'

export default function ElectionHistory() {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState(null)

  useEffect(() => {
    fetchElectionHistory()
      .then((data) => setHistory(Array.isArray(data) ? data : []))
      .catch(() => setErr('Could not load election history.'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="page">
      <div className="page-header">
        <p className="eyebrow">Records</p>
        <h1>Election history</h1>
        <p>Completed elections and their declared winners.</p>
      </div>

      {loading && <div className="loading-state">Loading history…</div>}
      {err && <div className="form-error">{err}</div>}

      {!loading && !err && history.length === 0 && (
        <div className="empty-state">
          <h3>No completed elections yet</h3>
          <p>Once an election is marked complete, it'll show up here with its winner.</p>
        </div>
      )}

      {history.map((h) => (
        <div key={h.electionId} className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 }}>
            <div>
              <h3 style={{ fontFamily: 'var(--serif)', margin: '0 0 4px' }}>{h.title}</h3>
              <div className="meta" style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                {h.position} · {h.area || '—'}
              </div>
            </div>
            {h.winner && (
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 600 }}>{h.winner.name}</div>
                <div className="party">{h.winner.party} · {h.winningVotes} votes</div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
