import { useCallback, useEffect, useMemo, useState } from 'react'
import { listOrders, updateOrder, errorMessage, fmtDate } from '../services/api'
import Icon from '../components/Icon'
import StatusBadge from '../components/StatusBadge'
import ProgressTracker from '../components/ProgressTracker'
import Thumb from '../components/Thumb'
import { FLOW, STATUS_META, nextStatus, categoryLabel, money } from '../components/status'

// Staff work with orders the customer has confirmed.
const STATUSES = [...FLOW, 'CANCELLED']

// "3 sản phẩm · 12 cái" style summary of an order
const summary = (o) => `${o.itemCount} sản phẩm · ${o.totalQuantity} cái`

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState(null) // null = all
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState(null)

  const load = useCallback(async () => {
    setError('')
    setLoading(true)
    try {
      setOrders(await listOrders())
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const counts = useMemo(() => {
    const c = {}
    STATUSES.forEach((s) => { c[s] = orders.filter((o) => o.status === s).length })
    return c
  }, [orders])

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase()
    return orders
      .filter((o) => !filter || o.status === filter)
      .filter((o) => !q || [o.code, o.customerName, o.customerEmail, o.trackingNumber, ...o.items.map((i) => i.title)]
        .some((v) => v && v.toLowerCase().includes(q)))
      .sort((a, b) => new Date(b.paidAt) - new Date(a.paidAt))
  }, [orders, filter, search])

  const selected = orders.find((o) => o.id === selectedId)
  const onSaved = (updated) => setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)))

  return (
    <div className="animate-fadeIn">
      <div className="mb-6 flex flex-wrap items-end gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Hàng đợi đơn hàng</h1>
          <p className="text-sm text-slate-500">{orders.length} đơn khách đã thanh toán · đơn chưa thanh toán chưa hiện ở đây</p>
        </div>
        <div className="flex w-full flex-wrap items-center gap-2 sm:ml-auto sm:w-auto">
          <div className="relative min-w-0 flex-1 sm:flex-none">
            <Icon name="search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm mã đơn, khách, sản phẩm…"
              className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-500/25 sm:w-80" />
          </div>
          <button onClick={load} className="btn-ghost" disabled={loading}>
            <Icon name="refresh" size={16} className={loading ? 'animate-spin' : ''} /> Làm mới
          </button>
        </div>
      </div>

      {/* KPI cards double as filters */}
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-5">
        {STATUSES.map((s) => {
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
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead className="border-b bg-slate-50/80 text-[11px] uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-4 py-3">Đơn hàng</th>
              <th className="px-4 py-3">Khách hàng</th>
              <th className="px-4 py-3">Tạm tính</th>
              <th className="px-4 py-3">Tiến độ</th>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3">Thanh toán lúc</th>
            </tr>
          </thead>
          <tbody>
            {loading && orders.length === 0 && (
              <tr><td colSpan="6" className="px-4 py-12 text-center text-slate-400">Đang tải đơn hàng…</td></tr>
            )}
            {!loading && visible.length === 0 && (
              <tr>
                <td colSpan="6" className="px-4 py-14 text-center text-slate-400">
                  <Icon name="inbox" size={36} className="mx-auto mb-2" />
                  {orders.length === 0 ? 'Chưa có đơn nào được khách thanh toán.' : 'Không có đơn hàng nào phù hợp với bộ lọc.'}
                </td>
              </tr>
            )}
            {visible.map((o) => (
              <tr key={o.id} onClick={() => setSelectedId(o.id)}
                className={`cursor-pointer border-b border-slate-100 last:border-0 transition hover:bg-sky-50/60 ${o.id === selectedId ? 'bg-sky-50' : ''}`}>
                <td className="max-w-sm px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-3">
                      {o.items.slice(0, 3).map((i) => <Thumb key={i.id} url={i.imageUrl} size={40} />)}
                    </div>
                    <div className="min-w-0">
                      <div className="font-mono text-xs font-semibold text-slate-500">#{o.code}</div>
                      <div className="truncate font-medium" title={o.items[0]?.title}>{o.items[0]?.title}</div>
                      <div className="text-xs text-slate-400">{summary(o)}{o.itemCount > 1 ? ` · +${o.itemCount - 1} sản phẩm khác` : ''}</div>
                    </div>
                  </div>
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <div>{o.customerName}</div>
                  <div className="text-xs text-slate-400">{o.customerEmail}</div>
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <div className="font-medium">{money(o.estimatedTotal)}</div>
                  {o.unpricedItems > 0 && <div className="text-xs text-amber-600">{o.unpricedItems} món chưa có giá</div>}
                </td>
                <td className="px-4 py-3"><ProgressTracker item={o} compact /></td>
                <td className="px-4 py-3"><StatusBadge status={o.status} />{!o.paymentVerified && o.status !== 'CANCELLED' && <div className="mt-1 text-[11px] font-semibold text-amber-600">Chờ đối soát tiền</div>}</td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-500">{fmtDate(o.paidAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && <Drawer key={selected.id} order={selected} onSaved={onSaved} onClose={() => setSelectedId(null)} />}
    </div>
  )
}

function Drawer({ order, onSaved, onClose }) {
  const [status, setStatus] = useState(order.status)
  const [tracking, setTracking] = useState(order.trackingNumber || '')
  const [notes, setNotes] = useState(order.staffNotes || '')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState(null)

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const next = nextStatus(order.status)
  const needsVerify = !order.paymentVerified && order.status !== 'CANCELLED'
  const dirty = status !== order.status || tracking !== (order.trackingNumber || '') || notes !== (order.staffNotes || '')

  const save = async (overrideStatus) => {
    setBusy(true)
    setMsg(null)
    try {
      // Send only what changed — the backend treats missing fields as "leave alone".
      const patch = {}
      const newStatus = overrideStatus || status
      if (newStatus !== order.status) patch.status = newStatus
      if (tracking !== (order.trackingNumber || '')) patch.trackingNumber = tracking
      if (notes !== (order.staffNotes || '')) patch.staffNotes = notes
      const updated = await updateOrder(order.id, patch)
      onSaved(updated)
      setStatus(updated.status)
      setMsg({ ok: true, text: 'Đã lưu' })
    } catch (err) {
      setMsg({ ok: false, text: errorMessage(err) })
    } finally {
      setBusy(false)
    }
  }

  // "The money has arrived": required before the order can be processed.
  const verify = async () => {
    setBusy(true)
    setMsg(null)
    try {
      const updated = await updateOrder(order.id, { paymentVerified: true })
      onSaved(updated)
      setMsg({ ok: true, text: 'Đã xác nhận nhận tiền' })
    } catch (err) {
      setMsg({ ok: false, text: errorMessage(err) })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div className="absolute inset-0 animate-fadeIn bg-navy-950/50 backdrop-blur-[2px]" onClick={onClose} />
      <aside className="relative flex h-full w-full max-w-lg animate-slideIn flex-col bg-white shadow-2xl">
        <div className="relative overflow-hidden bg-navy-950 p-5 text-white">
          <div className="absolute inset-0 bg-cover bg-bottom opacity-40" style={{ backgroundImage: "url('/bg-port.svg')" }} />
          <div className="absolute inset-0 bg-gradient-to-b from-navy-950/70 to-navy-950/30" />
          <div className="relative flex items-start justify-between gap-3">
            <div className="min-w-0">
              <StatusBadge status={order.status} />
              <h2 className="mt-2 text-lg font-bold leading-snug">Đơn #{order.code}</h2>
              <p className="mt-0.5 text-xs text-sky-100/70">{summary(order)} · {order.customerName}</p>
            </div>
            <button onClick={onClose} className="rounded-lg p-1.5 text-sky-100/80 hover:bg-white/10" aria-label="Đóng"><Icon name="x" /></button>
          </div>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto p-5 text-sm">
          <div className="card p-4"><ProgressTracker item={order} /></div>

          {order.status !== 'CANCELLED' || order.paymentVerified ? (
            <div className={`rounded-lg p-3 ring-1 ${order.paymentVerified ? 'bg-emerald-50 text-emerald-900 ring-emerald-100' : 'bg-amber-50 text-amber-900 ring-amber-200'}`}>
              <div className="text-xs font-semibold uppercase tracking-wide">Thanh toán</div>
              {order.paymentVerified ? (
                <p className="mt-1">Đã nhận tiền · xác nhận bởi <b>{order.paymentVerifiedBy}</b> lúc {fmtDate(order.paymentVerifiedAt)}</p>
              ) : (
                <>
                  <p className="mt-1">
                    Khách báo đã thanh toán lúc {fmtDate(order.paidAt)}. Hãy đối chiếu sao kê ngân hàng với nội dung chuyển khoản{' '}
                    <b className="font-mono">{order.paymentCode}</b> · tạm tính <b>{money(order.estimatedTotal)}</b>, rồi xác nhận.
                  </p>
                  <button onClick={verify} disabled={busy} className="btn-primary mt-2 w-full">Xác nhận đã nhận tiền</button>
                </>
              )}
            </div>
          ) : null}

          {next && order.status !== 'CANCELLED' && (
            <button onClick={() => save(next)} disabled={busy || needsVerify} className="btn-primary w-full py-2.5">
              Chuyển sang “{STATUS_META[next].label}” <Icon name="arrow" size={16} />
            </button>
          )}

          <section>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Sản phẩm trong đơn</h3>
            <ul className="divide-y rounded-lg border">
              {order.items.map((i) => (
                <li key={i.id} className="flex gap-3 p-3">
                  <Thumb url={i.imageUrl} size={56} />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium leading-snug">{i.title}</p>
                    <p className="text-xs text-slate-400">{i.site}{i.category ? ` · ${categoryLabel(i.category)}` : ''}</p>
                    {i.customerNote && <p className="mt-1 rounded bg-amber-50 px-2 py-1 text-xs text-amber-900">{i.customerNote}</p>}
                    {i.url && /^https?:\/\//.test(i.url) && (
                      <a href={i.url} target="_blank" rel="noopener noreferrer"
                        className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-accent-600 hover:underline">
                        Mở trang sản phẩm <Icon name="external" size={12} />
                      </a>
                    )}
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="font-semibold">× {i.quantity}</div>
                    <div className="text-xs text-slate-500">{i.price != null ? money(i.price) : 'chưa có giá'}</div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-2 flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
              <span className="text-slate-500">Tạm tính ({order.totalQuantity} cái)</span>
              <span className="font-bold">{money(order.estimatedTotal)}</span>
            </div>
            {order.unpricedItems > 0 && <p className="mt-1 text-xs text-amber-600">{order.unpricedItems} sản phẩm chưa đọc được giá, cần báo giá thủ công.</p>}
          </section>

          <dl className="grid grid-cols-[7rem_1fr] gap-y-2">
            <dt className="text-slate-400">Khách hàng</dt><dd>{order.customerName}<div className="text-xs text-slate-400">{order.customerEmail}</div></dd>
            <dt className="text-slate-400">Thanh toán lúc</dt><dd>{fmtDate(order.paidAt)}</dd>
          </dl>

          <hr className="border-slate-100" />

          <label className="block font-medium text-navy-800">Trạng thái
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="field">
              {STATUSES.map((s) => <option key={s} value={s} disabled={needsVerify && ['PURCHASED', 'SHIPPED', 'DELIVERED'].includes(s)}>{STATUS_META[s].label}</option>)}
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
