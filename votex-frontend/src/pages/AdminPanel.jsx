import { useEffect, useState } from 'react'
import { fetchElections, createElection, fetchCandidatesForElection, completeElection } from '../api/elections'
import { createCandidate, deleteCandidate } from '../api/candidates'
import client from '../api/client'
import { ENDPOINTS } from '../api/endpoints'

const electionInitial = {
  title: '', position: '', electionLevel: 'district', state: '', district: '',
  description: '', startDate: '', endDate: '',
}

const candidateInitial = { name: '', party: '', age: '' }

export default function AdminPanel() {
  const [elections, setElections] = useState([])
  const [selectedElection, setSelectedElection] = useState('')
  const [candidates, setCandidates] = useState([])
  const [msg, setMsg] = useState(null)

  const [electionForm, setElectionForm] = useState(electionInitial)
  const [candidateForm, setCandidateForm] = useState(candidateInitial)
  const [logoFile, setLogoFile] = useState(null)
  const [busy, setBusy] = useState(false)

  const [reverifyRequests, setReverifyRequests] = useState([])
  const [manualUserId, setManualUserId] = useState('')

  const loadElections = () => {
    fetchElections()
      .then((data) => setElections(Array.isArray(data) ? data : data.elections || []))
      .catch(() => {})
  }

  const loadReverifyRequests = () => {
    client.get(ENDPOINTS.reverificationRequests)
      .then(({ data }) => setReverifyRequests(Array.isArray(data) ? data : []))
      .catch(() => {})
  }

  useEffect(() => { loadElections(); loadReverifyRequests() }, [])

  useEffect(() => {
    if (!selectedElection) { setCandidates([]); return }
    fetchCandidatesForElection(selectedElection)
      .then((data) => setCandidates(Array.isArray(data) ? data : data.candidates || []))
      .catch(() => {})
  }, [selectedElection])

  const handleCreateElection = async (e) => {
    e.preventDefault()
    setBusy(true)
    setMsg(null)
    try {
      await createElection({
        title: electionForm.title,
        position: electionForm.position,
        electionLevel: electionForm.electionLevel,
        location: { state: electionForm.state, district: electionForm.district },
        description: electionForm.description,
        startDate: electionForm.startDate,
        endDate: electionForm.endDate,
      })
      setMsg({ type: 'success', text: 'Election created.' })
      setElectionForm(electionInitial)
      loadElections()
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Could not create election.' })
    } finally {
      setBusy(false)
    }
  }

  const handleComplete = async (electionId) => {
    if (!confirm('Mark this election complete and declare a winner?')) return
    try {
      const res = await completeElection(electionId)
      setMsg({ type: 'success', text: `${res.message}: ${res.winner} (${res.votes} votes)` })
      loadElections()
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Could not complete election.' })
    }
  }

  const handleAddCandidate = async (e) => {
    e.preventDefault()
    if (!selectedElection) {
      setMsg({ type: 'error', text: 'Select an election before adding a candidate.' })
      return
    }
    setBusy(true)
    setMsg(null)
    try {
      const fd = new FormData()
      fd.append('name', candidateForm.name)
      fd.append('party', candidateForm.party)
      fd.append('age', candidateForm.age)
      fd.append('election', selectedElection)
      if (logoFile) fd.append('logo', logoFile)

      await createCandidate(fd)
      setMsg({ type: 'success', text: 'Candidate added.' })
      setCandidateForm(candidateInitial)
      setLogoFile(null)
      fetchCandidatesForElection(selectedElection).then((data) => setCandidates(Array.isArray(data) ? data : []))
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Could not add candidate.' })
    } finally {
      setBusy(false)
    }
  }

  const handleDeleteCandidate = async (id) => {
    if (!confirm('Remove this candidate?')) return
    try {
      await deleteCandidate(id)
      setCandidates((prev) => prev.filter((c) => c._id !== id))
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.error || 'Could not remove candidate.' })
    }
  }

  const handleApproveReverify = async (userId) => {
    try {
      await client.put(ENDPOINTS.approveReverification(userId))
      setMsg({ type: 'success', text: 'Reverification approved.' })
      loadReverifyRequests()
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Could not approve.' })
    }
  }

  const handlePermanentBlock = async (userId) => {
    if (!confirm('Permanently block this user? This cannot be undone.')) return
    try {
      await client.put(ENDPOINTS.permanentBlock(userId))
      setMsg({ type: 'success', text: 'User permanently blocked.' })
      loadReverifyRequests()
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Could not block user.' })
    }
  }

  const handleManualAction = async (action) => {
    if (!manualUserId) return
    try {
      if (action === 'deactivate') await client.put(ENDPOINTS.deactivateUser(manualUserId))
      if (action === 'reactivate') await client.put(ENDPOINTS.reactivateUser(manualUserId))
      setMsg({ type: 'success', text: `User ${action}d.` })
      setManualUserId('')
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || `Could not ${action} user.` })
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <p className="eyebrow">Administration</p>
        <h1>Admin panel</h1>
        <p>Create elections, manage candidates, and review voter reverification requests.</p>
      </div>

      {msg && <div className={msg.type === 'success' ? 'form-success' : 'form-error'}>{msg.text}</div>}

      <h2 className="section-title">New election</h2>
      <form className="card" onSubmit={handleCreateElection}>
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input id="title" required value={electionForm.title} onChange={(e) => setElectionForm({ ...electionForm, title: e.target.value })} placeholder="e.g. District Council 2026" />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="position">Position</label>
            <input id="position" required value={electionForm.position} onChange={(e) => setElectionForm({ ...electionForm, position: e.target.value })} placeholder="e.g. Councillor" />
          </div>
          <div className="form-group">
            <label htmlFor="electionLevel">Election level</label>
            <select id="electionLevel" value={electionForm.electionLevel} onChange={(e) => setElectionForm({ ...electionForm, electionLevel: e.target.value })}>
              <option value="national">National</option>
              <option value="state">State</option>
              <option value="district">District</option>
            </select>
          </div>
        </div>
        {electionForm.electionLevel !== 'national' && (
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="state">State</label>
              <input id="state" required value={electionForm.state} onChange={(e) => setElectionForm({ ...electionForm, state: e.target.value })} />
            </div>
            {electionForm.electionLevel === 'district' && (
              <div className="form-group">
                <label htmlFor="district">District</label>
                <input id="district" required value={electionForm.district} onChange={(e) => setElectionForm({ ...electionForm, district: e.target.value })} />
              </div>
            )}
          </div>
        )}
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea id="description" rows={3} value={electionForm.description} onChange={(e) => setElectionForm({ ...electionForm, description: e.target.value })} />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="startDate">Start date</label>
            <input id="startDate" type="datetime-local" required value={electionForm.startDate} onChange={(e) => setElectionForm({ ...electionForm, startDate: e.target.value })} />
          </div>
          <div className="form-group">
            <label htmlFor="endDate">End date</label>
            <input id="endDate" type="datetime-local" required value={electionForm.endDate} onChange={(e) => setElectionForm({ ...electionForm, endDate: e.target.value })} />
          </div>
        </div>
        <button className="btn btn-gold" type="submit" disabled={busy}>Create election</button>
      </form>

      <h2 className="section-title">Existing elections</h2>
      <div className="card" style={{ padding: '8px 24px' }}>
        {elections.length === 0 && <p className="muted-note">No elections created yet.</p>}
        {elections.map((e) => (
          <div key={e._id} className="list-row">
            <div>
              <strong>{e.title}</strong>
              <div className="party">{e.status}</div>
            </div>
            <div className="action-row">
              <button className="btn btn-outline btn-sm" onClick={() => setSelectedElection(e._id)}>Manage candidates</button>
              {e.status !== 'completed' && (
                <button className="btn btn-danger btn-sm" onClick={() => handleComplete(e._id)}>Complete</button>
              )}
            </div>
          </div>
        ))}
      </div>

      {selectedElection && (
        <>
          <h2 className="section-title">Add candidate</h2>
          <form className="card" onSubmit={handleAddCandidate}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="cname">Candidate name</label>
                <input id="cname" required value={candidateForm.name} onChange={(e) => setCandidateForm({ ...candidateForm, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label htmlFor="cparty">Party</label>
                <input id="cparty" required value={candidateForm.party} onChange={(e) => setCandidateForm({ ...candidateForm, party: e.target.value })} />
              </div>
              <div className="form-group">
                <label htmlFor="cage">Age</label>
                <input id="cage" type="number" required value={candidateForm.age} onChange={(e) => setCandidateForm({ ...candidateForm, age: e.target.value })} />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="logo">Party logo</label>
              <input id="logo" type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files?.[0] || null)} />
              {logoFile && <img className="logo-preview" src={URL.createObjectURL(logoFile)} alt="Logo preview" />}
            </div>
            <button className="btn btn-gold" type="submit" disabled={busy}>Add candidate</button>
          </form>

          <div className="card" style={{ marginTop: 16, padding: '8px 24px' }}>
            {candidates.length === 0 && <p className="muted-note">No candidates for this election yet.</p>}
            {candidates.map((c) => (
              <div key={c._id} className="list-row">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {c.logo ? <img className="candidate-logo" src={`data:image/png;base64,${c.logo}`} alt="" /> : <div className="candidate-logo" />}
                  <div>
                    <strong>{c.name}</strong>
                    <div className="party">{c.party} · {c.voteCount ?? 0} votes</div>
                  </div>
                </div>
                <button className="btn btn-danger btn-sm" onClick={() => handleDeleteCandidate(c._id)}>Remove</button>
              </div>
            ))}
          </div>
        </>
      )}

      <h2 className="section-title">Reverification requests</h2>
      <div className="card" style={{ padding: '8px 24px' }}>
        {reverifyRequests.length === 0 && <p className="muted-note">No pending requests.</p>}
        {reverifyRequests.map((u) => (
          <div key={u._id} className="list-row">
            <div>
              <strong>{u.name}</strong>
              <div className="party">{u.aadharCardNumber} · {u.status}</div>
            </div>
            <div className="action-row">
              <button className="btn btn-gold btn-sm" onClick={() => handleApproveReverify(u._id)}>Approve</button>
            {u.role !=='admin' && ( <button className="btn btn-danger btn-sm" onClick={() => handlePermanentBlock(u._id)}>Permanently block</button>)} 
            </div>
          </div>
        ))}
      </div>

      <h2 className="section-title">Manual voter status</h2>
      <div className="warning-box">
        Your backend doesn't expose a "list all users" endpoint, so there's no picker here — paste a user's Mongo ID (visible in your database) to deactivate or reactivate their account directly.
      </div>
      <div className="card">
        <div className="form-group">
          <label htmlFor="manualUserId">User ID</label>
          <input id="manualUserId" value={manualUserId} onChange={(e) => setManualUserId(e.target.value)} placeholder="Mongo ObjectId" />
        </div>
        <div className="action-row">
          <button className="btn btn-outline" onClick={() => handleManualAction('deactivate')} disabled={!manualUserId}>Deactivate</button>
          <button className="btn btn-outline" onClick={() => handleManualAction('reactivate')} disabled={!manualUserId}>Reactivate</button>
        </div>
      </div>
    </div>
  )
}
