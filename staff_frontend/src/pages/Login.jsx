import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth, login, errorMessage } from '../services/api'
import AuthShell from '../components/AuthShell'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      const data = await login(email.trim(), password)
      if (data.role === 'CUSTOMER') {
        setError('This console is for staff. Customers should use the customer site.')
        return
      }
      auth.save(data)
      navigate('/')
    } catch (err) {
      const status = err.response?.status
      setError(status === 401 || status === 400 ? 'Invalid email or password' : errorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthShell
      title="Move every order from cart to doorstep."
      subtitle="The staff console for purchasing agents: review new orders, buy, ship and track — all in one queue."
      bullets={[
        ['cart', 'Review items customers add from 1688 & Taobao'],
        ['truck', 'Update status and tracking numbers in one click'],
        ['warehouse', 'Keep customers informed until delivery'],
      ]}
    >
      <form onSubmit={submit} className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-navy-900">Staff sign in</h2>
          <p className="text-sm text-slate-500">Use your staff or admin account.</p>
        </div>
        {error && <p className="rounded-lg bg-red-50 p-2.5 text-sm text-red-700 ring-1 ring-red-100">{error}</p>}
        <label className="block text-sm font-medium text-navy-800">Email
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
            className="field" autoComplete="username" />
        </label>
        <label className="block text-sm font-medium text-navy-800">Password
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
            className="field" autoComplete="current-password" />
        </label>
        <button disabled={busy} className="btn-primary w-full py-2.5">{busy ? 'Signing in…' : 'Sign in'}</button>
      </form>
    </AuthShell>
  )
}
