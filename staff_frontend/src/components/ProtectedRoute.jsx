import { Navigate } from 'react-router-dom'
import { auth } from '../services/api'

export default function ProtectedRoute({ children, adminOnly = false }) {
  const user = auth.user()
  if (!auth.token() || !user) return <Navigate to="/login" replace />
  if (adminOnly && user.role !== 'ADMIN') return <Navigate to="/" replace />
  return children
}
