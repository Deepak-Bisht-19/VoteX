import { createContext, useContext, useState, useCallback } from 'react'
import { loginUser, registerUser, fetchProfile } from '../api/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('votex_user')
    return stored ? JSON.parse(stored) : null
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Your backend's /user/login and /user/signup only return a token, not
  // the user object — so we store the token, then call GET /user/profile
  // to get the actual user (name, role, status, etc.) for the UI.
  const loadUserFromToken = async (token) => {
    localStorage.setItem('votex_token', token)
    const data = await fetchProfile()
    const userData = data.user || data
    localStorage.setItem('votex_user', JSON.stringify(userData))
    setUser(userData)
    return userData
  }

  const login = useCallback(async (credentials) => {
    setLoading(true)
    setError(null)
    try {
      const data = await loginUser(credentials) // { aadharCardNumber, password }
      return await loadUserFromToken(data.token)
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Login failed. Check your Aadhaar number and password.')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const register = useCallback(async (payload) => {
    setLoading(true)
    setError(null)
    try {
      const data = await registerUser(payload)
      if (data.token) await loadUserFromToken(data.token)
      return data
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('votex_token')
    localStorage.removeItem('votex_user')
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
