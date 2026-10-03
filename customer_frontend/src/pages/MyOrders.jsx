import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth, listMine, errorMessage, fmtDate, STATUSES } from '../services/api'
import StatusBadge from '../components/StatusBadge'

const money = (i) => (i.price != null ? `${i.currency || ''} ${i.price}` : '—')

export default function MyOrders() {
  const navigate = useNavigate()
  const user = auth.user()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('ALL')

  const load = async () => {
    setError('')
    try {
      setItems(await listMine())
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const visible = useMemo(
    () => items
      .filter((i) => filter === 'ALL' || i.status === filter)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [items, filter]
  )

  const logout = () => {
    auth.clear()
    navigate('/login')
  }

  return (
    <div className="min-h-screen">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-4xl items-center gap-3 px-4 py-3">
          <span className="font-semibold">Order Agent</span>
          <div className="ml-auto flex items-center gap-3 text-sm text-slate-600">
            <span>{user?.name}</span>
            <button onClick={logout} className="rounded border px-3 py-1 hover:bg-slate-100">Sign out</button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-6">
        <div className="mb-4 flex items-center gap-3">
          <h1 className="text-xl font-semibold">My items</h1>
          <button onClick={load} className="rounded border bg-white px-3 py-1 text-sm hover:bg-slate-100">Refresh</button>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          {['ALL', ...STATUSES].map((s) => (
            <button key={s} onClick={() => setFilter(s)}
              className={`rounded-full border px-3 py-1 text-sm ${filter === s ? 'border-slate-900 bg-slate-900 text-white' : 'bg-white hover:bg-slate-100'}`}>
              {s === 'ALL' ? 'All' : s}
            </button>
          ))}
        </div>

        {error && <p className="mb-4 rounded bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        {loading && <p className="text-slate-500">Loading…</p>}

        {!loading && items.length === 0 && (
          <div className="rounded-lg border bg-white p-6 text-sm text-slate-600">
            <p className="mb-2 font-medium text-slate-900">Nothing here yet.</p>
            Install the Order Insight Tracker browser extension, sign in with this account, and add items to your
            cart on 1688.com or taobao.com. They will show up here automatically.
          </div>
        )}
        {!loading && items.length > 0 && visible.length === 0 && (
          <p className="text-slate-500">No items with this status.</p>
        )}

        <ul className="space-y-3">
          {visible.map((i) => (
            <li key={i.id} className="rounded-lg border bg-white p-4 text-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium leading-snug">{i.title}</p>
                  <p className="mt-0.5 text-xs text-slate-400">
                    {i.site}{i.category ? ` · ${i.category}` : ''} · Qty {i.quantity} · {money(i)}
                  </p>
                </div>
                <StatusBadge status={i.status} />
              </div>

              <dl className="mt-3 grid grid-cols-[7rem_1fr] gap-y-1 text-slate-600">
                <dt className="text-slate-400">Added</dt><dd>{fmtDate(i.createdAt)}</dd>
                {i.purchasedAt && <><dt className="text-slate-400">Purchased</dt><dd>{fmtDate(i.purchasedAt)}</dd></>}
                {i.shippedAt && <><dt className="text-slate-400">Shipped</dt><dd>{fmtDate(i.shippedAt)}</dd></>}
                {i.deliveredAt && <><dt className="text-slate-400">Delivered</dt><dd>{fmtDate(i.deliveredAt)}</dd></>}
                {i.trackingNumber && <><dt className="text-slate-400">Tracking</dt><dd className="font-mono">{i.trackingNumber}</dd></>}
              </dl>

              {i.url && /^https?:\/\//.test(i.url) && (
                <a href={i.url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-blue-600 hover:underline">
                  Product page ↗
                </a>
              )}
            </li>
          ))}
        </ul>
      </main>
    </div>
  )
}
