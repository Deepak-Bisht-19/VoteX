import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Register from './pages/Register'
import AdminSignup from './pages/AdminSignup'
import Dashboard from './pages/Dashboard'
import ElectionDetail from './pages/ElectionDetail'
import Results from './pages/Results'
import ElectionHistory from './pages/ElectionHistory'
import Profile from './pages/Profile'
import AdminPanel from './pages/AdminPanel'

export default function App() {
  return (
    <div className="app-shell">
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin-signup" element={<AdminSignup />} />
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/history" element={<ProtectedRoute><ElectionHistory /></ProtectedRoute>} />
        <Route path="/elections/:id" element={<ProtectedRoute><ElectionDetail /></ProtectedRoute>} />
        <Route path="/elections/:id/results" element={<ProtectedRoute><Results /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute adminOnly><AdminPanel /></ProtectedRoute>} />
      </Routes>
    </div>
  )
}
