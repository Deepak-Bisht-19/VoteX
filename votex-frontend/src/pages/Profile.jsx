import { useEffect, useState } from 'react'
import { fetchProfile, changePassword, requestReverification } from '../api/auth'

export default function Profile() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '' })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState(null)

  useEffect(() => {
    fetchProfile()
      .then((data) => setProfile(data.user || data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMsg(null)
    try {
      await changePassword(pwForm)
      setMsg({ type: 'success', text: 'Password updated successfully.' })
      setPwForm({ currentPassword: '', newPassword: '' })
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.error || 'Could not update password.' })
    } finally {
      setSaving(false)
    }
  }

  const handleReverify = async () => {
    setMsg(null)
    try {
      const res = await requestReverification()
      setMsg({ type: 'success', text: res.message || 'Reverification requested.' })
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Could not submit request.' })
    }
  }

  if (loading) return <div className="page"><div className="loading-state">Loading profile…</div></div>

  return (
    <div className="page page-narrow">
      <div className="page-header">
        <p className="eyebrow">Your account</p>
        <h1>Profile</h1>
      </div>

      {msg && <div className={msg.type === 'success' ? 'form-success' : 'form-error'}>{msg.text}</div>}

      <div className="card">
        <div className="form-group"><label>Name</label><div>{profile?.name}</div></div>
        <div className="form-group"><label>Aadhaar number</label><div>{profile?.aadharCardNumber}</div></div>
        <div className="form-group"><label>Location</label><div>{profile?.location?.district}, {profile?.location?.state}</div></div>
        <div className="form-group"><label>Status</label><div style={{ textTransform: 'capitalize' }}>{profile?.status}</div></div>
        <div className="form-group"><label>Role</label><div style={{ textTransform: 'capitalize' }}>{profile?.role}</div></div>
      </div>

      {(profile?.status === 'expired' || profile?.status === 'inactive') && !profile?.reverificationRequested && (
        <div className="card" style={{ marginTop: 16 }}>
          <p style={{ marginTop: 0, fontSize: 14 }}>Your account is {profile.status}. Request reverification to regain access.</p>
          <button className="btn btn-gold" onClick={handleReverify}>Request reverification</button>
        </div>
      )}

      <h2 className="section-title">Change password</h2>
      <form className="card" onSubmit={handlePasswordChange}>
        <div className="form-group">
          <label htmlFor="currentPassword">Current password</label>
          <input id="currentPassword" type="password" required value={pwForm.currentPassword} onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })} />
        </div>
        <div className="form-group">
          <label htmlFor="newPassword">New password</label>
          <input id="newPassword" type="password" required minLength={6} value={pwForm.newPassword} onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })} />
        </div>
        <button className="btn btn-gold" type="submit" disabled={saving}>
          {saving ? 'Saving…' : 'Update password'}
        </button>
      </form>
    </div>
  )
}
