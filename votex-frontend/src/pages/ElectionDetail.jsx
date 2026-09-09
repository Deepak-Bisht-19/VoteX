import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { fetchElection, fetchCandidatesForElection, completeElection } from '../api/elections'
import { castVote } from '../api/candidates'
import { useAuth } from '../context/AuthContext'

export default function ElectionDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const [election, setElection] = useState(null)
  const [candidates, setCandidates] = useState([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState(null)
  const [votingId, setVotingId] = useState(null)
  const [voted, setVoted] = useState(false)
  const [voteMsg, setVoteMsg] = useState(null)

  const load = () => {
    Promise.all([fetchElection(id), fetchCandidatesForElection(id)])
      .then(([electionData, candidateData]) => {
        setElection(electionData)
        setCandidates(Array.isArray(candidateData) ? candidateData : candidateData.candidates || [])
      })
      .catch(() => setErr('Could not load this election. It may not exist, or the backend is unreachable.'))
      .finally(() => setLoading(false))
  }

  useEffect(load, [id])

  const handleVote = async (candidateId) => {
    setVotingId(candidateId)
    setVoteMsg(null)
    try {
      const res = await castVote(candidateId)
      setVoted(true)
      setVoteMsg({ type: 'success', text: res.message ? `${res.message} — voted for ${res.votedFor}` : 'Your vote has been recorded.' })
      load()
    } catch (e) {
      setVoteMsg({ type: 'error', text: e.response?.data?.message || e.response?.data?.error || 'Could not cast your vote.' })
    } finally {
      setVotingId(null)
    }
  }

  const handleComplete = async () => {
    if (!confirm('Mark this election as completed and declare the winner? This cannot be undone.')) return
    try {
      const res = await completeElection(id)
      setVoteMsg({ type: 'success', text: `${res.message}: ${res.winner} (${res.votes} votes)` })
      load()
    } catch (e) {
      setVoteMsg({ type: 'error', text: e.response?.data?.message || 'Could not complete the election.' })
    }
  }

  if (loading) return <div className="page"><div className="loading-state">Loading election…</div></div>
  if (err) return <div className="page"><div className="form-error">{err}</div></div>

  return (
    <div className="page">
      <div className="page-header">
        <p className="eyebrow">{election?.position} · {election?.electionLevel}</p>
        <h1>{election?.title}</h1>
        <p>{election?.description}</p>
      </div>

      {voteMsg && (
        <div className={voteMsg.type === 'success' ? 'form-success' : 'form-error'}>{voteMsg.text}</div>
      )}

      <div className="card" style={{ padding: '8px 24px' }}>
        {candidates.length === 0 && (
          <div className="empty-state">
            <h3>No candidates yet</h3>
            <p>Candidates for this election haven't been added.</p>
          </div>
        )}
        <ul className="ballot">
          {candidates.map((c) => (
            <li key={c._id} className="ballot-item">
              <span className="ballot-num" />
              {c.logo ? (
                <img className="candidate-logo" src={`data:image/png;base64,${c.logo}`} alt={`${c.party} logo`} />
              ) : (
                <div className="candidate-logo" />
              )}
              <div className="candidate-info">
                <h4>{c.name}</h4>
                <div className="party">{c.party}</div>
              </div>
              <span className="vote-count" style={{ marginRight: 8 }}>{c.voteCount ?? 0}</span>
              <button
                className="btn btn-gold"
                disabled={voted || election?.status === 'completed' || votingId === c._id}
                onClick={() => handleVote(c._id)}
              >
                {votingId === c._id ? 'Voting…' : 'Vote'}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="action-row" style={{ marginTop: 24 }}>
        <Link to={`/elections/${id}/results`} className="btn btn-outline">View live results</Link>
        {user?.role === 'admin' && election?.status !== 'completed' && (
          <button className="btn btn-danger" onClick={handleComplete}>Mark election complete</button>
        )}
      </div>
    </div>
  )
}
