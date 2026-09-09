import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import BallotSeal from './BallotSeal'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="navbar">
      <NavLink to="/" className="brand">
        <BallotSeal />
        VoteX
      </NavLink>
      <div className="nav-links">
        <NavLink to="/" end>Elections</NavLink>
        <NavLink to="/history">History</NavLink>
        {user?.role === 'admin' && <NavLink to="/admin">Admin</NavLink>}
        {user && <NavLink to="/profile">Profile</NavLink>}
        {user ? (
          <>
            <span className="nav-user">{user.name}</span>
            <button className="btn btn-outline" onClick={handleLogout} style={{ color: '#F2EFE6', borderColor: '#2B3A55' }}>
              Log out
            </button>
          </>
        ) : (
          <NavLink to="/login" className="btn btn-gold">Sign in</NavLink>
        )}
      </div>
    </nav>
  )
}
