import { useCallback, useEffect, useMemo, useState } from 'react'
import { listItems, updateItem, errorMessage, fmtDate, STATUSES } from '../services/api'
import StatusBadge from '../components/StatusBadge'

const money = (item) => (item.price != null ? `${item.currency || ''} ${item.price}` : '—')

export default function Orders() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('ALL')
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState(null)

  const load = useCallback(async () => {
    setError('')
    try {
      setItems(await listItems())
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const counts = useMemo(() => {
    const c = { ALL: items.length }
    STATUSES.forEach((s) => { c[s] = items.filter((i) => i.status === s).length })
    return c
  }, [items])

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase()
    return items
      .filter((i) => filter === 'ALL' || i.status === filter)
      .filter((i) => !q || [i.title, i.customerName, i.customerEmail, i.trackingNumber, i.category]
        .some((v) => v && v.toLowerCase().includes(q)))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }, [items, filter, search])

  const selected = items.find((i) => i.id === selectedId)

  const onSaved = (updated) => setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)))

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <h1 className="text-xl font-semibold">Orders</h1>
        <button onClick={load} className="rounded border bg-white px-3 py-1 text-sm hover:bg-slate-100">Refresh</button>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search item, customer, tracking…"
          className="ml-auto w-72 rounded border bg-white px-3 py-1.5 text-sm" />
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {['ALL', ...STATUSES].map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`rounded-full border px-3 py-1 text-sm ${filter === s ? 'border-slate-900 bg-slate-900 text-white' : 'bg-white hover:bg-slate-100'}`}>
            {s === 'ALL' ? 'All' : s} <span className="opacity-70">{counts[s]}</span>
          </button>
        ))}
      </div>

      {error && <p className="mb-4 rounded bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      <div className="flex gap-4">
        <div className="min-w-0 flex-1 overflow-x-auto rounded-lg border bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">Added</th>
                <th className="px-3 py-2">Customer</th>
                <th className="px-3 py-2">Item</th>
                <th className="px-3 py-2">Qty</th>
                <th className="px-3 py-2">Price</th>
                <th className="px-3 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan="6" className="px-3 py-6 text-center text-slate-500">Loading…</td></tr>}
              {!loading && visible.length === 0 && (
                <tr><td colSpan="6" className="px-3 py-6 text-center text-slate-500">No orders match.</td></tr>
              )}
              {visible.map((i) => (
                <tr key={i.id} onClick={() => setSelectedId(i.id)}
                  className={`cursor-pointer border-b last:border-0 hover:bg-slate-50 ${i.id === selectedId ? 'bg-blue-50' : ''}`}>
                  <td className="whitespace-nowrap px-3 py-2 text-slate-500">{fmtDate(i.createdAt)}</td>
                  <td className="px-3 py-2">{i.customerName}<div className="text-xs text-slate-400">{i.customerEmail}</div></td>
                  <td className="max-w-xs px-3 py-2">
                    <div className="truncate" title={i.title}>{i.title}</div>
                    <div className="text-xs text-slate-400">{i.site}{i.category ? ` · ${i.category}` : ''}</div>
                  </td>
                  <td className="px-3 py-2">{i.quantity}</td>
                  <td className="whitespace-nowrap px-3 py-2">{money(i)}</td>
                  <td className="px-3 py-2"><StatusBadge status={i.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {selected && <Detail key={selected.id} item={selected} onSaved={onSaved} onClose={() => setSelectedId(null)} />}
      </div>
    </div>
  )
}

function Detail({ item, onSaved, onClose }) {
  const [status, setStatus] = useState(item.status)
  const [tracking, setTracking] = useState(item.trackingNumber || '')
  const [notes, setNotes] = useState(item.staffNotes || '')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState(null)

  const dirty = status !== item.status || tracking !== (item.trackingNumber || '') || notes !== (item.staffNotes || '')

  const save = async () => {
    setBusy(true)
    setMsg(null)
    try {
      // Send only what changed — the backend treats missing fields as "leave alone".
      const patch = {}
      if (status !== item.status) patch.status = status
      if (tracking !== (item.trackingNumber || '')) patch.trackingNumber = tracking
      if (notes !== (item.staffNotes || '')) patch.staffNotes = notes
      onSaved(await updateItem(item.id, patch))
      setMsg({ ok: true, text: 'Saved' })
    } catch (err) {
      setMsg({ ok: false, text: errorMessage(err) })
    } finally {
      setBusy(false)
    }
  }

  return (
    <aside className="w-96 shrink-0 space-y-4 rounded-lg border bg-white p-4 text-sm">
      <div className="flex items-start justify-between gap-2">
        <h2 className="font-semibold leading-snug">{item.title}</h2>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-700" aria-label="Close">✕</button>
      </div>

      <dl className="grid grid-cols-[7rem_1fr] gap-y-1">
        <dt className="text-slate-500">Customer</dt><dd>{item.customerName} ({item.customerEmail})</dd>
        <dt className="text-slate-500">Site</dt><dd>{item.site}</dd>
        <dt className="text-slate-500">Category</dt><dd>{item.category || '—'}</dd>
        <dt className="text-slate-500">Quantity</dt><dd>{item.quantity}</dd>
        <dt className="text-slate-500">Price</dt><dd>{money(item)}</dd>
        <dt className="text-slate-500">Added</dt><dd>{fmtDate(item.createdAt)}</dd>
        <dt className="text-slate-500">Purchased</dt><dd>{fmtDate(item.purchasedAt)}</dd>
        <dt className="text-slate-500">Shipped</dt><dd>{fmtDate(item.shippedAt)}</dd>
        <dt className="text-slate-500">Delivered</dt><dd>{fmtDate(item.deliveredAt)}</dd>
      </dl>

      {item.url && /^https?:\/\//.test(item.url) && (
        <a href={item.url} target="_blank" rel="noopener noreferrer" className="block text-blue-600 hover:underline">
          Open product page ↗
        </a>
      )}

      <hr />

      <label className="block">Status
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="mt-1 w-full rounded border px-3 py-2">
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </label>
      <label className="block">Tracking number
        <input value={tracking} onChange={(e) => setTracking(e.target.value)} className="mt-1 w-full rounded border px-3 py-2" />
      </label>
      <label className="block">Staff notes
        <textarea rows="3" value={notes} onChange={(e) => setNotes(e.target.value)} className="mt-1 w-full rounded border px-3 py-2" />
      </label>

      {msg && <p className={msg.ok ? 'text-emerald-700' : 'text-red-700'}>{msg.text}</p>}
      <button onClick={save} disabled={!dirty || busy} className="w-full rounded bg-slate-900 py-2 text-white disabled:opacity-40">
        {busy ? 'Saving…' : 'Save changes'}
      </button>
    </aside>
  )
}
