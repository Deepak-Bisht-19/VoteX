import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const initial = {
  name: '',
  age: '',
  email: '',
  mobile: '',
  address: '',
  state: '',
  district: '',
  aadharCardNumber: '',
  password: '',
}

export default function Register() {
  const { register, loading, error } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState(initial)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    const payload = {
      name: form.name,
      age: Number(form.age),
      email: form.email || undefined,
      mobile: form.mobile,
      address: form.address,
      location: { state: form.state, district: form.district },
      aadharCardNumber: form.aadharCardNumber,
      password: form.password,
    }
    try {
      await register(payload)
      navigate('/')
    } catch {
      // error surfaced via auth context
    }
  }

  return (
    <div className="page page-narrow">
      <div className="auth-card">
        <p className="eyebrow">Voter registration</p>
        <h1>Create your account</h1>
        <p className="sub">Your state and district determine which elections you're eligible to vote in.</p>

        {error && <div className="form-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Full name</label>
            <input id="name" name="name" required value={form.name} onChange={handleChange} placeholder="Jane Doe" />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="age">Age</label>
              <input id="age" name="age" type="number" min={18} required value={form.age} onChange={handleChange} placeholder="18" />
            </div>
            <div className="form-group">
              <label htmlFor="mobile">Mobile number</label>
              <input id="mobile" name="mobile" required pattern="\d{10}" maxLength={10} inputMode="numeric" value={form.mobile} onChange={handleChange} placeholder="10-digit number" />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="email">Email (optional)</label>
            <input id="email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@example.com" />
          </div>
          <div className="form-group">
            <label htmlFor="address">Address</label>
            <input id="address" name="address" required value={form.address} onChange={handleChange} placeholder="Street, city" />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="state">State</label>
              <input id="state" name="state" required value={form.state} onChange={handleChange} placeholder="e.g. Uttarakhand" />
            </div>
            <div className="form-group">
              <label htmlFor="district">District</label>
              <input id="district" name="district" required value={form.district} onChange={handleChange} placeholder="e.g. Dehradun" />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="aadharCardNumber">Aadhaar card number</label>
            <input id="aadharCardNumber" name="aadharCardNumber" required pattern="\d{12}" maxLength={12} inputMode="numeric" value={form.aadharCardNumber} onChange={handleChange} placeholder="12-digit Aadhaar number" />
            <div className="form-hint">Used to sign in — you'll enter this instead of a username.</div>
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input id="password" name="password" type="password" required minLength={6} value={form.password} onChange={handleChange} placeholder="••••••••" />
          </div>
          <button className="btn btn-gold" type="submit" disabled={loading} style={{ width: '100%' }}>
            {loading ? 'Creating account…' : 'Register'}
          </button>
        </form>

        <div className="auth-switch">
          Already registered? <Link to="/login">Sign in</Link>
        </div>
        <div className="auth-switch" style={{ marginTop: 8, fontSize: 12 }}>
          Setting up the system for the first time? <Link to="/admin-signup">Create the admin account</Link>
        </div>
      </div>
    </div>
  )
}
