import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Orders from './pages/Orders'
import Chat from './pages/Chat'
import Staff from './pages/Staff'
import Payment from './pages/Payment'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/" element={<Orders />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/payment" element={<ProtectedRoute adminOnly><Payment /></ProtectedRoute>} />
        <Route path="/staff" element={<ProtectedRoute adminOnly><Staff /></ProtectedRoute>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
