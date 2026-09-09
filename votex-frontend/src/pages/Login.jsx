import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login, loading, error } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ aadharCardNumber: '', password: '' })

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await login(form)
      navigate('/')
    } catch {
      // error surfaced via auth context
    }
  }

  return (
    <div className="page page-narrow">
      <div className="auth-card">
        <p className="eyebrow">Voter access</p>
        <h1>Sign in to VoteX</h1>
        <p className="sub">Enter your Aadhaar number and password to view elections and cast your vote.</p>

        {error && <div className="form-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="aadharCardNumber">Aadhaar card number</label>
            <input
              id="aadharCardNumber"
              name="aadharCardNumber"
              required
              inputMode="numeric"
              pattern="\d{12}"
              maxLength={12}
              value={form.aadharCardNumber}
              onChange={handleChange}
              placeholder="12-digit Aadhaar number"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input id="password" name="password" type="password" required value={form.password} onChange={handleChange} placeholder="••••••••" />
          </div>
          <button className="btn btn-gold" type="submit" disabled={loading} style={{ width: '100%' }}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <div className="auth-switch">
          Not registered yet? <Link to="/register">Create an account</Link>
        </div>
      </div>
    </div>
  )
}
