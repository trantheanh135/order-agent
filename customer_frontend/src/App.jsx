import { Routes, Route, Navigate } from 'react-router-dom'
import { auth } from './services/api'
import Login from './pages/Login'
import MyOrders from './pages/MyOrders'

function Protected({ children }) {
  return auth.token() && auth.user() ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Login register />} />
      <Route path="/" element={<Protected><MyOrders /></Protected>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
