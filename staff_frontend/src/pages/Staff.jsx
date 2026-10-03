import { useState } from 'react'
import { createStaff, errorMessage } from '../services/api'
import Icon from '../components/Icon'

const EMPTY = { name: '', email: '', password: '', role: 'STAFF' }

export default function Staff() {
  const [form, setForm] = useState(EMPTY)
  const [msg, setMsg] = useState(null)
  const [busy, setBusy] = useState(false)
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setMsg(null)
    setBusy(true)
    try {
      await createStaff(form)
      setMsg({ ok: true, text: `Created ${form.role} account for ${form.email}` })
      setForm(EMPTY)
    } catch (err) {
      setMsg({ ok: false, text: errorMessage(err) })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="max-w-xl animate-riseIn">
      <div className="mb-6 flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-navy-900 text-accent-400"><Icon name="users" /></span>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Staff accounts</h1>
          <p className="text-sm text-slate-500">Create logins for the people who process orders.</p>
        </div>
      </div>

      <form onSubmit={submit} className="card space-y-4 p-6">
        {msg && (
          <p className={`rounded-lg p-2.5 text-sm ring-1 ${msg.ok ? 'bg-emerald-50 text-emerald-800 ring-emerald-100' : 'bg-red-50 text-red-700 ring-red-100'}`}>
            {msg.text}
          </p>
        )}
        <label className="block text-sm font-medium text-navy-800">Name
          <input required value={form.name} onChange={set('name')} className="field" />
        </label>
        <label className="block text-sm font-medium text-navy-800">Email
          <input type="email" required value={form.email} onChange={set('email')} className="field" />
        </label>
        <label className="block text-sm font-medium text-navy-800">Password <span className="font-normal text-slate-400">(min 8 characters)</span>
          <input type="password" required minLength={8} value={form.password} onChange={set('password')}
            className="field" autoComplete="new-password" />
        </label>
        <label className="block text-sm font-medium text-navy-800">Role
          <select value={form.role} onChange={set('role')} className="field">
            <option value="STAFF">STAFF — process orders</option>
            <option value="ADMIN">ADMIN — also manage accounts</option>
          </select>
        </label>
        <button disabled={busy} className="btn-primary">{busy ? 'Creating…' : 'Create account'}</button>
      </form>
    </div>
  )
}
