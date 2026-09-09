import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { registerAdmin } from '../api/auth'
import { useAuth } from '../context/AuthContext'

const initial = {
  name: '', age: '', email: '', mobile: '', address: '', state: '', district: '',
  aadharCardNumber: '', password: '', adminKey: '',
}

export default function AdminSignup() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [form, setForm] = useState(initial)
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState(null)
  const [done, setDone] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErr(null)
    try {
      await registerAdmin({
        name: form.name,
        age: Number(form.age),
        email: form.email || undefined,
        mobile: form.mobile,
        address: form.address,
        location: { state: form.state, district: form.district },
        aadharCardNumber: form.aadharCardNumber,
        password: form.password,
        adminKey: form.adminKey,
      })
      setDone(true)
      // Log the new admin in immediately using their Aadhaar + password.
      await login({ aadharCardNumber: form.aadharCardNumber, password: form.password })
      navigate('/admin')
    } catch (e2) {
      setErr(e2.response?.data?.message || 'Could not create admin account. Check the admin key.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page page-narrow">
      <div className="auth-card">
        <p className="eyebrow">Restricted</p>
        <h1>Create admin account</h1>
        <p className="sub">Requires the ADMIN_SECRET_KEY set in the backend's .env. Your backend only allows one admin account total.</p>

        {err && <div className="form-error">{err}</div>}
        {done && !err && <div className="form-success">Admin created — signing you in…</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Full name</label>
            <input id="name" name="name" required value={form.name} onChange={handleChange} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="age">Age</label>
              <input id="age" name="age" type="number" required value={form.age} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label htmlFor="mobile">Mobile</label>
              <input id="mobile" name="mobile" required pattern="\d{10}" maxLength={10} value={form.mobile} onChange={handleChange} />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="address">Address</label>
            <input id="address" name="address" required value={form.address} onChange={handleChange} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="state">State</label>
              <input id="state" name="state" required value={form.state} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label htmlFor="district">District</label>
              <input id="district" name="district" required value={form.district} onChange={handleChange} />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="aadharCardNumber">Aadhaar card number</label>
            <input id="aadharCardNumber" name="aadharCardNumber" required pattern="\d{12}" maxLength={12} value={form.aadharCardNumber} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input id="password" name="password" type="password" required minLength={6} value={form.password} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label htmlFor="adminKey">Admin secret key</label>
            <input id="adminKey" name="adminKey" required value={form.adminKey} onChange={handleChange} placeholder="matches ADMIN_SECRET_KEY in backend .env" />
          </div>
          <button className="btn btn-gold" type="submit" disabled={loading} style={{ width: '100%' }}>
            {loading ? 'Creating…' : 'Create admin account'}
          </button>
        </form>

        <div className="auth-switch">
          <Link to="/login">Back to sign in</Link>
        </div>
      </div>
    </div>
  )
}
