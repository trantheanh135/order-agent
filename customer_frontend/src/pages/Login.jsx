import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { auth, login, register, errorMessage } from '../services/api'
import AuthShell from '../components/AuthShell'

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
        setError('This site is for customers. Staff should use the staff console.')
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

  return (
    <AuthShell
      title="Shop 1688 & Taobao. Track every parcel."
      subtitle="Add items to your cart while you browse — we buy, ship and keep you updated from the warehouse to your door."
      bullets={[
        ['cart', 'Items are captured automatically by the browser extension'],
        ['ship', 'Follow each order from purchase to delivery'],
        ['pin', 'See tracking numbers the moment they are issued'],
      ]}
    >
      <form onSubmit={submit} className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-navy-900">{isRegister ? 'Create your account' : 'Welcome back'}</h2>
          <p className="text-sm text-slate-500">{isRegister ? 'It takes less than a minute.' : 'Sign in to see your orders.'}</p>
        </div>
        {error && <p className="rounded-lg bg-red-50 p-2.5 text-sm text-red-700 ring-1 ring-red-100">{error}</p>}
        {isRegister && (
          <label className="block text-sm font-medium text-navy-800">Name
            <input required value={name} onChange={(e) => setName(e.target.value)} className="field" />
          </label>
        )}
        <label className="block text-sm font-medium text-navy-800">Email
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
            className="field" autoComplete="username" />
        </label>
        <label className="block text-sm font-medium text-navy-800">Password{isRegister && <span className="font-normal text-slate-400"> (min 8 characters)</span>}
          <input type="password" required minLength={isRegister ? 8 : undefined} value={password}
            onChange={(e) => setPassword(e.target.value)} className="field"
            autoComplete={isRegister ? 'new-password' : 'current-password'} />
        </label>
        <button disabled={busy} className="btn-primary w-full py-2.5">
          {busy ? 'Please wait…' : isRegister ? 'Create account' : 'Sign in'}
        </button>
        <p className="text-center text-sm text-slate-500">
          {isRegister
            ? <>Already have an account? <Link to="/login" className="font-semibold text-accent-600 hover:underline">Sign in</Link></>
            : <>New here? <Link to="/register" className="font-semibold text-accent-600 hover:underline">Create an account</Link></>}
        </p>
      </form>
    </AuthShell>
  )
}
