import { useCallback, useEffect, useMemo, useState } from 'react'
import { listItems, updateItem, errorMessage, fmtDate } from '../services/api'
import Icon from '../components/Icon'
import StatusBadge from '../components/StatusBadge'
import ProgressTracker from '../components/ProgressTracker'
import { FLOW, STATUS_META, nextStatus, categoryLabel } from '../components/status'

const ALL_STATUSES = [...FLOW, 'CANCELLED']
const money = (item) => (item.price != null ? `${item.currency || ''} ${item.price}`.trim() : '—')

export default function Orders() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState(null) // null = all
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState(null)

  const load = useCallback(async () => {
    setError('')
    setLoading(true)
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
    const c = {}
    ALL_STATUSES.forEach((s) => { c[s] = items.filter((i) => i.status === s).length })
    return c
  }, [items])

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase()
    return items
      .filter((i) => !filter || i.status === filter)
      .filter((i) => !q || [i.title, i.customerName, i.customerEmail, i.trackingNumber, categoryLabel(i.category)]
        .some((v) => v && v.toLowerCase().includes(q)))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }, [items, filter, search])

  const selected = items.find((i) => i.id === selectedId)
  const onSaved = (updated) => setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)))

  return (
    <div className="animate-fadeIn">
      <div className="mb-6 flex flex-wrap items-end gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Hàng đợi đơn hàng</h1>
          <p className="text-sm text-slate-500">{items.length} món hàng của tất cả khách hàng</p>
        </div>
        <div className="flex w-full flex-wrap items-center gap-2 sm:ml-auto sm:w-auto">
          <div className="relative min-w-0 flex-1 sm:flex-none">
            <Icon name="search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm sản phẩm, khách, mã vận đơn…"
              className="w-full rounded-lg border sm:w-80 border-slate-300 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-500/25" />
          </div>
          <button onClick={load} className="btn-ghost" disabled={loading}>
            <Icon name="refresh" size={16} className={loading ? 'animate-spin' : ''} /> Làm mới
          </button>
        </div>
      </div>

      {/* KPI cards double as filters */}
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-5">
        {ALL_STATUSES.map((s) => {
          const m = STATUS_META[s]
          const active = filter === s
          return (
            <button key={s} onClick={() => setFilter(active ? null : s)}
              className={`card flex items-center gap-3 p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md ${active ? 'ring-2 ring-accent-500' : ''}`}>
              <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${m.tile}`}><Icon name={m.icon} size={22} /></span>
              <span>
                <span className="block text-2xl font-bold leading-none">{counts[s]}</span>
                <span className="mt-1 block text-xs font-medium text-slate-500">{m.label}</span>
              </span>
            </button>
          )
        })}
      </div>

      {filter && (
        <p className="mb-3 text-sm text-slate-500">
          Đang lọc: <b>{STATUS_META[filter].label}</b> ·{' '}
          <button onClick={() => setFilter(null)} className="font-medium text-accent-600 hover:underline">Xem tất cả</button>
        </p>
      )}
      {error && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 ring-1 ring-red-100">{error}</p>}

      <div className="card overflow-x-auto">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead className="border-b bg-slate-50/80 text-[11px] uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-4 py-3">Sản phẩm</th>
              <th className="px-4 py-3">Khách hàng</th>
              <th className="px-4 py-3">SL × Đơn giá</th>
              <th className="px-4 py-3">Tiến độ</th>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3">Ngày thêm</th>
            </tr>
          </thead>
          <tbody>
            {loading && items.length === 0 && (
              <tr><td colSpan="6" className="px-4 py-12 text-center text-slate-400">Đang tải đơn hàng…</td></tr>
            )}
            {!loading && visible.length === 0 && (
              <tr>
                <td colSpan="6" className="px-4 py-14 text-center text-slate-400">
                  <Icon name="inbox" size={36} className="mx-auto mb-2" />
                  {items.length === 0 ? 'Chưa có đơn hàng nào. Sản phẩm sẽ xuất hiện khi khách hàng thêm vào giỏ.' : 'Không có đơn hàng nào phù hợp với bộ lọc.'}
                </td>
              </tr>
            )}
            {visible.map((i) => (
              <tr key={i.id} onClick={() => setSelectedId(i.id)}
                className={`cursor-pointer border-b border-slate-100 last:border-0 transition hover:bg-sky-50/60 ${i.id === selectedId ? 'bg-sky-50' : ''}`}>
                <td className="max-w-xs px-4 py-3">
                  <div className="truncate font-medium" title={i.title}>{i.title}</div>
                  <div className="text-xs text-slate-400">{i.site}{i.category ? ` · ${categoryLabel(i.category)}` : ''}</div>
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <div>{i.customerName}</div>
                  <div className="text-xs text-slate-400">{i.customerEmail}</div>
                </td>
                <td className="whitespace-nowrap px-4 py-3">{i.quantity} × {money(i)}</td>
                <td className="px-4 py-3"><ProgressTracker item={i} compact /></td>
                <td className="px-4 py-3"><StatusBadge status={i.status} /></td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-500">{fmtDate(i.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && <Drawer key={selected.id} item={selected} onSaved={onSaved} onClose={() => setSelectedId(null)} />}
    </div>
  )
}

function Drawer({ item, onSaved, onClose }) {
  const [status, setStatus] = useState(item.status)
  const [tracking, setTracking] = useState(item.trackingNumber || '')
  const [notes, setNotes] = useState(item.staffNotes || '')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState(null)

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const next = nextStatus(item.status)
  const dirty = status !== item.status || tracking !== (item.trackingNumber || '') || notes !== (item.staffNotes || '')

  const save = async (overrideStatus) => {
    setBusy(true)
    setMsg(null)
    try {
      // Send only what changed — the backend treats missing fields as "leave alone".
      const patch = {}
      const newStatus = overrideStatus || status
      if (newStatus !== item.status) patch.status = newStatus
      if (tracking !== (item.trackingNumber || '')) patch.trackingNumber = tracking
      if (notes !== (item.staffNotes || '')) patch.staffNotes = notes
      const updated = await updateItem(item.id, patch)
      onSaved(updated)
      setStatus(updated.status)
      setMsg({ ok: true, text: 'Đã lưu' })
    } catch (err) {
      setMsg({ ok: false, text: errorMessage(err) })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div className="absolute inset-0 animate-fadeIn bg-navy-950/50 backdrop-blur-[2px]" onClick={onClose} />
      <aside className="relative flex h-full w-full max-w-md animate-slideIn flex-col bg-white shadow-2xl">
        <div className="relative overflow-hidden bg-navy-950 p-5 text-white">
          <div className="absolute inset-0 bg-cover bg-bottom opacity-40" style={{ backgroundImage: "url('/bg-port.svg')" }} />
          <div className="absolute inset-0 bg-gradient-to-b from-navy-950/70 to-navy-950/30" />
          <div className="relative flex items-start justify-between gap-3">
            <div className="min-w-0">
              <StatusBadge status={item.status} />
              <h2 className="mt-2 text-lg font-bold leading-snug">{item.title}</h2>
              <p className="mt-0.5 text-xs text-sky-100/70">{item.site}{item.category ? ` · ${categoryLabel(item.category)}` : ''}</p>
            </div>
            <button onClick={onClose} className="rounded-lg p-1.5 text-sky-100/80 hover:bg-white/10" aria-label="Đóng"><Icon name="x" /></button>
          </div>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto p-5 text-sm">
          <div className="card p-4"><ProgressTracker item={item} /></div>

          {next && item.status !== 'CANCELLED' && (
            <button onClick={() => save(next)} disabled={busy} className="btn-primary w-full py-2.5">
              Chuyển sang “{STATUS_META[next].label}” <Icon name="arrow" size={16} />
            </button>
          )}

          <dl className="grid grid-cols-[6.5rem_1fr] gap-y-2">
            <dt className="text-slate-400">Khách hàng</dt><dd>{item.customerName}<div className="text-xs text-slate-400">{item.customerEmail}</div></dd>
            <dt className="text-slate-400">Số lượng</dt><dd>{item.quantity}</dd>
            <dt className="text-slate-400">Giá</dt><dd>{money(item)}</dd>
            <dt className="text-slate-400">Ngày thêm</dt><dd>{fmtDate(item.createdAt)}</dd>
          </dl>

          {item.url && /^https?:\/\//.test(item.url) && (
            <a href={item.url} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-medium text-accent-600 hover:underline">
              Mở trang sản phẩm <Icon name="external" size={14} />
            </a>
          )}

          <hr className="border-slate-100" />

          <label className="block font-medium text-navy-800">Trạng thái
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="field">
              {ALL_STATUSES.map((s) => <option key={s} value={s}>{STATUS_META[s].label}</option>)}
            </select>
          </label>
          <label className="block font-medium text-navy-800">Mã vận đơn
            <input value={tracking} onChange={(e) => setTracking(e.target.value)} placeholder="VD: SF1234567890" className="field font-mono" />
          </label>
          <label className="block font-medium text-navy-800">Ghi chú nội bộ
            <textarea rows="3" value={notes} onChange={(e) => setNotes(e.target.value)} className="field" />
          </label>
        </div>

        <div className="border-t bg-slate-50 p-4">
          {msg && <p className={`mb-2 text-sm ${msg.ok ? 'text-emerald-700' : 'text-red-700'}`}>{msg.text}</p>}
          <button onClick={() => save()} disabled={!dirty || busy} className="btn-primary w-full py-2.5">
            {busy ? 'Đang lưu…' : 'Lưu thay đổi'}
          </button>
        </div>
      </aside>
    </div>
  )
}
