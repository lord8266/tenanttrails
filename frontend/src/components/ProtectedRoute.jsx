import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  // Wait for the /me check to resolve before deciding, so a refresh does not
  // bounce a logged-in user to the login page.
  if (loading) {
    return <div className="route-loading">Loading…</div>
  }
  if (!user) {
    return <Navigate to="/login" replace />
  }
  return children
}
