import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { auth, login, register, errorMessage } from '../services/api'

export default function Login({ register: isRegister = false }) {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      const data = isRegister
        ? await register(name.trim(), email.trim(), password)
        : await login(email.trim(), password)
      if (data.role !== 'CUSTOMER') {
        setError('This site is for customers. Staff should use the staff site.')
        return
      }
      auth.save(data)
      navigate('/')
    } catch (err) {
      const status = err.response?.status
      if (!isRegister && (status === 401 || status === 400)) setError('Invalid email or password')
      else if (isRegister && status === 409) setError('That email is already registered')
      else setError(errorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  const input = 'mt-1 w-full rounded border px-3 py-2'

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <form onSubmit={submit} className="w-full max-w-sm space-y-4 rounded-lg border bg-white p-6 shadow-sm">
        <h1 className="text-lg font-semibold">{isRegister ? 'Create your account' : 'Sign in'}</h1>
        {error && <p className="rounded bg-red-50 p-2 text-sm text-red-700">{error}</p>}
        {isRegister && (
          <label className="block text-sm">Name
            <input required value={name} onChange={(e) => setName(e.target.value)} className={input} />
          </label>
        )}
        <label className="block text-sm">Email
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
            className={input} autoComplete="username" />
        </label>
        <label className="block text-sm">Password{isRegister && ' (min 8 characters)'}
          <input type="password" required minLength={isRegister ? 8 : undefined} value={password}
            onChange={(e) => setPassword(e.target.value)} className={input}
            autoComplete={isRegister ? 'new-password' : 'current-password'} />
        </label>
        <button disabled={busy} className="w-full rounded bg-slate-900 py-2 text-white disabled:opacity-50">
          {busy ? 'Please wait…' : isRegister ? 'Create account' : 'Sign in'}
        </button>
        <p className="text-center text-sm text-slate-500">
          {isRegister
            ? <>Already have an account? <Link to="/login" className="text-blue-600 hover:underline">Sign in</Link></>
            : <>New here? <Link to="/register" className="text-blue-600 hover:underline">Create an account</Link></>}
        </p>
      </form>
    </div>
  )
}
