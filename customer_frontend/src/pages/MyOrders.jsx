import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth, listMine, errorMessage } from '../services/api'
import Icon from '../components/Icon'
import Logo from '../components/Logo'
import StatusBadge from '../components/StatusBadge'
import ProgressTracker from '../components/ProgressTracker'
import { STATUS_META } from '../components/status'

const money = (i) => (i.price != null ? `${i.currency || ''} ${i.price}`.trim() : '—')
const FILTERS = ['ALL', 'NEW', 'PURCHASED', 'SHIPPED', 'DELIVERED', 'CANCELLED']

export default function MyOrders() {
  const navigate = useNavigate()
  const user = auth.user()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('ALL')

  const load = async () => {
    setError('')
    setLoading(true)
    try {
      setItems(await listMine())
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const count = (s) => items.filter((i) => i.status === s).length
  const stats = [
    { label: 'Total items', value: items.length, icon: 'package', tile: 'bg-sky-100 text-sky-600' },
    { label: 'Being processed', value: count('NEW') + count('PURCHASED'), icon: 'cart', tile: 'bg-amber-100 text-amber-600' },
    { label: 'In transit', value: count('SHIPPED'), icon: 'truck', tile: 'bg-violet-100 text-violet-600' },
    { label: 'Delivered', value: count('DELIVERED'), icon: 'warehouse', tile: 'bg-emerald-100 text-emerald-600' },
  ]

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
      {/* Hero banner */}
      <div className="relative overflow-hidden bg-navy-950">
        <div className="absolute inset-0 bg-cover bg-[position:70%_75%]" style={{ backgroundImage: "url('/bg-port.svg')" }} />
        <div className="absolute inset-0 bg-gradient-to-r from-navy-950/95 via-navy-950/70 to-navy-950/20" />
        <div className="relative mx-auto max-w-5xl px-4 pb-24 pt-5">
          <div className="flex items-center justify-between">
            <Logo label="Order Agent" sub="My orders" />
            <div className="flex items-center gap-3 text-sm text-sky-100">
              <span className="hidden sm:inline">{user?.name}</span>
              <button onClick={logout} className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 ring-1 ring-white/15 hover:bg-white/20">
                <Icon name="logout" size={15} /> Sign out
              </button>
            </div>
          </div>
          <h1 className="mt-8 text-3xl font-extrabold tracking-tight text-white">Hi {user?.name?.split(' ')[0]} 👋</h1>
          <p className="mt-1 text-sky-100/80">Here is where your parcels are right now.</p>
        </div>
      </div>

      <main className="relative mx-auto -mt-14 max-w-5xl px-4 pb-12">
        {/* Summary */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {stats.map((s, n) => (
            <div key={s.label} className="card flex animate-riseIn items-center gap-3 p-4" style={{ animationDelay: `${n * 60}ms` }}>
              <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${s.tile}`}><Icon name={s.icon} size={22} /></span>
              <span>
                <span className="block text-2xl font-bold leading-none">{s.value}</span>
                <span className="mt-1 block text-xs font-medium text-slate-500">{s.label}</span>
              </span>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="mt-6 flex flex-wrap items-center gap-2">
          {FILTERS.map((s) => (
            <button key={s} onClick={() => setFilter(s)}
              className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
                filter === s ? 'bg-navy-900 text-white shadow' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'
              }`}>
              {s === 'ALL' ? 'All' : STATUS_META[s].label}
            </button>
          ))}
          <button onClick={load} disabled={loading} className="btn-ghost ml-auto">
            <Icon name="refresh" size={15} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>

        {error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 ring-1 ring-red-100">{error}</p>}
        {loading && items.length === 0 && <p className="mt-10 text-center text-slate-400">Loading your items…</p>}

        {!loading && items.length === 0 && !error && <EmptyState />}
        {!loading && items.length > 0 && visible.length === 0 && (
          <p className="mt-10 text-center text-slate-400">No items with this status.</p>
        )}

        <ul className="mt-4 space-y-4">
          {visible.map((i) => <ItemCard key={i.id} item={i} />)}
        </ul>
      </main>
    </div>
  )
}

function ItemCard({ item: i }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(i.trackingNumber)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch { /* clipboard unavailable on plain http — ignore */ }
  }

  return (
    <li className="card animate-riseIn overflow-hidden">
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-semibold leading-snug">{i.title}</p>
            <p className="mt-1 text-xs text-slate-400">
              {i.site}{i.category ? ` · ${i.category}` : ''} · Qty {i.quantity} · {money(i)}
            </p>
          </div>
          <StatusBadge status={i.status} />
        </div>

        <div className="mt-5"><ProgressTracker item={i} /></div>
      </div>

      {(i.trackingNumber || (i.url && /^https?:\/\//.test(i.url))) && (
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t bg-slate-50/70 px-5 py-3 text-sm">
          {i.trackingNumber && (
            <div className="flex items-center gap-2">
              <Icon name="pin" size={16} className="text-accent-600" />
              <span className="text-slate-500">Tracking</span>
              <span className="font-mono font-semibold">{i.trackingNumber}</span>
              <button onClick={copy} className="rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700" title="Copy">
                <Icon name={copied ? 'check' : 'copy'} size={14} />
              </button>
            </div>
          )}
          {i.url && /^https?:\/\//.test(i.url) && (
            <a href={i.url} target="_blank" rel="noopener noreferrer"
              className="ml-auto inline-flex items-center gap-1.5 font-medium text-accent-600 hover:underline">
              Product page <Icon name="external" size={14} />
            </a>
          )}
        </div>
      )}
    </li>
  )
}

function EmptyState() {
  const steps = [
    ['Install the extension', 'Load the Order Insight Tracker in Chrome and sign in with this account.'],
    ['Browse 1688 or Taobao', 'Click “Add to cart” on any product, as you normally would.'],
    ['Watch it travel', 'Your item shows up here, then moves from purchase to delivery.'],
  ]
  return (
    <div className="card mt-6 p-8 text-center">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-100 text-sky-600"><Icon name="inbox" size={28} /></span>
      <h2 className="mt-3 text-lg font-bold">No items yet</h2>
      <p className="text-sm text-slate-500">Get started in three steps:</p>
      <ol className="mx-auto mt-6 grid max-w-3xl gap-4 text-left sm:grid-cols-3">
        {steps.map(([t, d], n) => (
          <li key={t} className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-100">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent-500 text-sm font-bold text-white">{n + 1}</span>
            <p className="mt-2 font-semibold">{t}</p>
            <p className="mt-1 text-sm text-slate-500">{d}</p>
          </li>
        ))}
      </ol>
    </div>
  )
}
