import { useState } from 'react'
import { createStaff, errorMessage } from '../services/api'

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
    <div className="max-w-md">
      <h1 className="mb-4 text-xl font-semibold">Create staff account</h1>
      <form onSubmit={submit} className="space-y-4 rounded-lg border bg-white p-5">
        {msg && (
          <p className={`rounded p-2 text-sm ${msg.ok ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-700'}`}>
            {msg.text}
          </p>
        )}
        <label className="block text-sm">Name
          <input required value={form.name} onChange={set('name')} className="mt-1 w-full rounded border px-3 py-2" />
        </label>
        <label className="block text-sm">Email
          <input type="email" required value={form.email} onChange={set('email')}
            className="mt-1 w-full rounded border px-3 py-2" />
        </label>
        <label className="block text-sm">Password (min 8 characters)
          <input type="password" required minLength={8} value={form.password} onChange={set('password')}
            className="mt-1 w-full rounded border px-3 py-2" autoComplete="new-password" />
        </label>
        <label className="block text-sm">Role
          <select value={form.role} onChange={set('role')} className="mt-1 w-full rounded border px-3 py-2">
            <option value="STAFF">STAFF — process orders</option>
            <option value="ADMIN">ADMIN — also manage accounts</option>
          </select>
        </label>
        <button disabled={busy} className="rounded bg-slate-900 px-4 py-2 text-white disabled:opacity-50">
          {busy ? 'Creating…' : 'Create account'}
        </button>
      </form>
    </div>
  )
}
