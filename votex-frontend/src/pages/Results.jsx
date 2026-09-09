import { useEffect, useState, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { io } from 'socket.io-client'
import { fetchElection, fetchCandidatesForElection } from '../api/elections'

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export default function Results() {
  const { id } = useParams()
  const [election, setElection] = useState(null)
  const [candidates, setCandidates] = useState([])
  const [connected, setConnected] = useState(false)
  const [loading, setLoading] = useState(true)
  const socketRef = useRef(null)

  useEffect(() => {
    fetchElection(id).then(setElection).catch(() => {})

    fetchCandidatesForElection(id)
      .then((data) => setCandidates(Array.isArray(data) ? data : data.candidates || []))
      .catch(() => {})
      .finally(() => setLoading(false))

    // Your backend emits io.emit("voteUpdate", { candidateId, candidateName,
    // voteCount, electionId }) from candidateRoutes.js on every vote.
    const socket = io(SOCKET_URL, { transports: ['websocket'] })
    socketRef.current = socket

    socket.on('connect', () => setConnected(true))
    socket.on('disconnect', () => setConnected(false))

    socket.on('voteUpdate', (payload) => {
      if (!payload || payload.electionId !== id) return
      setCandidates((prev) =>
        prev.map((c) => (c._id === payload.candidateId ? { ...c, voteCount: payload.voteCount } : c))
      )
    })

    return () => socket.disconnect()
  }, [id])

  const totalVotes = candidates.reduce((sum, c) => sum + (c.voteCount || 0), 0)
  const sorted = [...candidates].sort((a, b) => (b.voteCount || 0) - (a.voteCount || 0))
  const leaderId = sorted[0]?._id

  return (
    <div className="page">
      <div className="page-header">
        <p className="eyebrow">Live tally</p>
        <h1>{election?.title || 'Results'}</h1>
        <span className="live-indicator">
          <span className="live-dot" />
          {connected ? 'Live updates connected' : 'Connecting…'}
        </span>
      </div>

      {loading && <div className="loading-state">Loading results…</div>}

      {!loading && sorted.length === 0 && (
        <div className="empty-state">
          <h3>No candidates yet</h3>
          <p>Results will appear here once candidates and votes come in.</p>
        </div>
      )}

      <div className="card">
        {sorted.map((c) => {
          const votes = c.voteCount || 0
          const pct = totalVotes ? Math.round((votes / totalVotes) * 100) : 0
          const isLeader = c._id === leaderId && votes > 0
          const isDeclaredWinner = election?.status === 'completed' && election?.winner === c._id
          return (
            <div key={c._id} style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span>
                  <strong>{c.name}</strong>{' '}
                  <span className="party">{c.party}</span>
                  {isDeclaredWinner && <span className="winner-badge">Winner</span>}
                  {election?.status !== 'completed' && isLeader && <span className="winner-badge" style={{ background: 'var(--gold-dim)' }}>Leading</span>}
                </span>
                <span className="vote-count">{votes}</span>
              </div>
              <div className="result-bar-track">
                <div className="result-bar-fill" style={{ width: `${pct}%` }} />
              </div>
            </div>
          )
        })}
      </div>

      <div style={{ marginTop: 24 }}>
        <Link to={`/elections/${id}`} className="btn btn-outline">Back to ballot</Link>
      </div>
    </div>
  )
}
