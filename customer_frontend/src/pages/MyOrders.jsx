import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  auth, getCurrentOrder, listMyOrders, updateCurrentItem, removeCurrentItem, discardCurrentOrder,
  confirmCurrentOrder, getPaymentInfo, reportPaid, cancelUnpaid, errorMessage, fmtDate,
} from '../services/api'
import PaymentCard from '../components/PaymentCard'
import Icon from '../components/Icon'
import Logo from '../components/Logo'
import StatusBadge from '../components/StatusBadge'
import ProgressTracker from '../components/ProgressTracker'
import Thumb from '../components/Thumb'
import ChatWidget from '../components/ChatWidget'
import { GUIDE_URL } from '../config'
import { FLOW, STATUS_META, categoryLabel, money } from '../components/status'

const FILTERS = ['ALL', ...FLOW, 'CANCELLED']

export default function MyOrders() {
  const navigate = useNavigate()
  const user = auth.user()
  const [current, setCurrent] = useState(null)   // the open order (status NEW)
  const [orders, setOrders] = useState([])       // orders already paid (and later), plus cancelled ones
  const [awaiting, setAwaiting] = useState([])   // confirmed but not paid yet: QR payment due
  const [payInfo, setPayInfo] = useState(null)   // QR image + transfer details set by the admin
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState('')
  const [filter, setFilter] = useState('ALL')

  const load = useCallback(async () => {
    setError('')
    setLoading(true)
    try {
      const [cur, all, info] = await Promise.all([getCurrentOrder(), listMyOrders(), getPaymentInfo().catch(() => null)])
      setCurrent(cur)
      setPayInfo(info)
      setAwaiting(all.filter((o) => o.status === 'AWAITING_PAYMENT'))
      setOrders(all.filter((o) => o.status !== 'NEW' && o.status !== 'AWAITING_PAYMENT'))
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  // Run an action on the open order, then show what the server returned.
  const act = async (fn, successNotice) => {
    setBusy(true)
    setError('')
    setNotice('')
    try {
      setCurrent(await fn())
      if (successNotice) setNotice(successNotice)
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  const confirm = async () => {
    if (!window.confirm('Xác nhận đơn này và chuyển sang bước thanh toán? Sau khi xác nhận bạn không sửa được đơn nữa.')) return
    setBusy(true)
    setError('')
    try {
      await confirmCurrentOrder()
      setNotice('Đã xác nhận đơn hàng. Hãy thanh toán bằng mã QR bên dưới, nhân viên sẽ xử lý đơn sau khi bạn báo đã thanh toán.')
      await load()
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  // "I have paid" -> the order becomes visible to staff; "cancel" -> never reaches them.
  const payAction = async (order, kind) => {
    if (kind === 'paid' && !window.confirm('Bạn đã chuyển khoản xong? Nhân viên sẽ đối chiếu và xử lý đơn.')) return
    if (kind === 'cancel' && !window.confirm('Hủy đơn này?')) return
    setBusy(true)
    setError('')
    setNotice('')
    try {
      await (kind === 'paid' ? reportPaid(order.id) : cancelUnpaid(order.id))
      setNotice(kind === 'paid' ? 'Cảm ơn bạn! Nhân viên sẽ đối chiếu khoản thanh toán và xử lý đơn.' : 'Đã hủy đơn.')
      await load()
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  const count = (...s) => orders.filter((o) => s.includes(o.status)).length
  const stats = [
    { label: 'Tổng số đơn', value: orders.length, icon: 'package', tile: 'bg-sky-100 text-sky-600' },
    { label: 'Đang xử lý', value: count('CONFIRMED', 'PURCHASED'), icon: 'cart', tile: 'bg-amber-100 text-amber-600' },
    { label: 'Đang vận chuyển', value: count('SHIPPED'), icon: 'truck', tile: 'bg-violet-100 text-violet-600' },
    { label: 'Đã giao', value: count('DELIVERED'), icon: 'warehouse', tile: 'bg-emerald-100 text-emerald-600' },
  ]

  const visible = useMemo(
    () => orders
      .filter((o) => filter === 'ALL' || o.status === filter)
      .sort((a, b) => new Date(b.confirmedAt) - new Date(a.confirmedAt)),
    [orders, filter]
  )

  const logout = () => {
    auth.clear()
    navigate('/login')
  }

  const hasDraft = current && current.itemCount > 0

  return (
    <div className="min-h-screen">
      {/* Hero banner */}
      <div className="relative overflow-hidden bg-navy-950">
        <div className="absolute inset-0 bg-cover bg-[position:70%_75%]" style={{ backgroundImage: "url('/bg-port.svg')" }} />
        <div className="absolute inset-0 bg-gradient-to-r from-navy-950/95 via-navy-950/70 to-navy-950/20" />
        <div className="relative mx-auto max-w-5xl px-4 pb-24 pt-5">
          <div className="flex items-center justify-between">
            <Logo label="Hàng Về" sub="Đơn hàng của tôi" />
            <div className="flex items-center gap-3 text-sm text-sky-100">
              <a href={GUIDE_URL} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg bg-accent-500 px-3 py-1.5 font-semibold text-white shadow hover:bg-accent-600">
                <Icon name="play" size={16} /> <span className="hidden sm:inline">Video hướng dẫn</span><span className="sm:hidden">Hướng dẫn</span>
              </a>
              <span className="hidden sm:inline">{user?.name}</span>
              <button onClick={logout} className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 ring-1 ring-white/15 hover:bg-white/20">
                <Icon name="logout" size={15} /> Đăng xuất
              </button>
            </div>
          </div>
          <h1 className="mt-8 text-3xl font-extrabold tracking-tight text-white">Xin chào {user?.name?.split(' ').slice(-1)[0]} 👋</h1>
          <p className="mt-1 text-sky-100/80">Đây là đơn đang soạn và tình trạng các đơn bạn đã gửi.</p>
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

        {error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 ring-1 ring-red-100">{error}</p>}
        {notice && <p className="mt-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800 ring-1 ring-emerald-100">{notice}</p>}
        {loading && !current && <p className="mt-10 text-center text-slate-400">Đang tải đơn hàng của bạn…</p>}

        {/* ---- Confirmed orders waiting for payment (QR) ---- */}
        {!loading && awaiting.length > 0 && (
          <section className="mt-6 space-y-4">
            <h2 className="text-lg font-bold">Đơn chờ thanh toán</h2>
            {awaiting.map((o) => (
              <PaymentCard key={o.id} order={o} info={payInfo} busy={busy}
                onPaid={() => payAction(o, 'paid')} onCancel={() => payAction(o, 'cancel')} />
            ))}
          </section>
        )}

        {/* ---- The open order ---- */}
        {!loading && (
          <section className="mt-6">
            <div className="mb-2 flex items-center gap-3">
              <h2 className="text-lg font-bold">Đơn đang soạn</h2>
              <StatusBadge status="NEW" />
              <button onClick={load} disabled={loading || busy} className="btn-ghost ml-auto">
                <Icon name="refresh" size={15} className={loading ? 'animate-spin' : ''} /> Làm mới
              </button>
            </div>

            {hasDraft ? (
              <div className="card overflow-hidden border-2 border-dashed border-slate-300">
                <p className="border-b bg-slate-50 px-5 py-2.5 text-sm text-slate-600">
                  Đơn này <b>chưa gửi</b> cho nhân viên. Bạn có thể thêm sản phẩm từ tiện ích Hàng Về trên 1688/Taobao, rồi bấm <b>Xác nhận đặt hàng</b> khi xong.
                </p>
                <ul className="divide-y">
                  {current.items.map((i) => (
                    <li key={i.id} className="flex gap-3 p-4 text-sm">
                      <Thumb url={i.imageUrl} size={64} />
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold leading-snug">{i.title}</p>
                        <p className="mt-0.5 text-xs text-slate-400">{i.site}{i.category ? ` · ${categoryLabel(i.category)}` : ''}</p>
                        {i.customerNote && <p className="mt-1 text-xs text-amber-700">{i.customerNote}</p>}
                        {i.url && /^https?:\/\//.test(i.url) && (
                          <a href={i.url} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-accent-600 hover:underline">
                            Trang sản phẩm <Icon name="external" size={12} />
                          </a>
                        )}
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-2">
                        <div className="font-semibold">{i.price != null ? money(i.price * i.quantity) : <span className="text-xs font-normal text-slate-400">chưa có giá</span>}</div>
                        <div className="flex items-center gap-1">
                          <button disabled={busy || i.quantity <= 1} onClick={() => act(() => updateCurrentItem(i.id, i.quantity - 1))}
                            className="h-8 w-8 rounded-lg border bg-white text-lg leading-none hover:bg-slate-50 disabled:opacity-40" aria-label="Giảm">−</button>
                          <span className="w-10 text-center font-semibold">{i.quantity}</span>
                          <button disabled={busy} onClick={() => act(() => updateCurrentItem(i.id, i.quantity + 1))}
                            className="h-8 w-8 rounded-lg border bg-white text-lg leading-none hover:bg-slate-50 disabled:opacity-40" aria-label="Tăng">+</button>
                        </div>
                        <button disabled={busy} onClick={() => act(() => removeCurrentItem(i.id))} className="text-xs font-medium text-red-600 hover:underline">Xóa khỏi đơn</button>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="flex flex-wrap items-center gap-3 border-t bg-slate-50 px-5 py-4">
                  <div className="text-sm">
                    <div className="text-slate-500">{current.itemCount} sản phẩm · {current.totalQuantity} cái</div>
                    <div className="text-lg font-bold">Tạm tính: {money(current.estimatedTotal)}</div>
                    {current.unpricedItems > 0 && <div className="text-xs text-amber-600">{current.unpricedItems} sản phẩm chưa có giá, nhân viên sẽ báo giá.</div>}
                  </div>
                  <div className="ml-auto flex gap-2">
                    <button disabled={busy} onClick={() => window.confirm('Xóa toàn bộ đơn đang soạn?') && act(discardCurrentOrder, 'Đã xóa đơn đang soạn.')} className="btn-ghost">Xóa đơn</button>
                    <button disabled={busy} onClick={confirm} className="btn-primary">Xác nhận đặt hàng</button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="card p-6 text-sm text-slate-600">
                <p className="mb-1 font-medium text-slate-900">Bạn chưa có sản phẩm nào trong đơn đang soạn.</p>
                <p className="mb-3">
                  Chưa biết bắt đầu từ đâu?{' '}
                  <a href={GUIDE_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-semibold text-accent-600 hover:underline">
                    <Icon name="play" size={14} /> Xem video hướng dẫn đặt hàng
                  </a>
                </p>
                <ol className="grid gap-3 sm:grid-cols-3">
                  {[
                    ['Mở sản phẩm', 'Vào một sản phẩm trên 1688 hoặc Taobao.'],
                    ['Thêm vào đơn', 'Chọn số lượng/phân loại như bình thường, rồi bấm “Thêm vào đơn” ở nút nổi Hàng Về. Thêm được nhiều sản phẩm.'],
                    ['Xác nhận & thanh toán', 'Xem lại đơn, bấm “Xác nhận đặt hàng”, rồi thanh toán bằng mã QR. Nhân viên xử lý đơn sau khi bạn báo đã thanh toán.'],
                  ].map(([t, d], n) => (
                    <li key={t} className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-100">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent-500 text-sm font-bold text-white">{n + 1}</span>
                      <p className="mt-2 font-semibold text-slate-900">{t}</p>
                      <p className="mt-1 text-slate-500">{d}</p>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </section>
        )}

        {/* ---- Orders already sent ---- */}
        {!loading && (
          <section className="mt-8">
            <h2 className="mb-2 text-lg font-bold">Đơn đã gửi</h2>
            <div className="flex flex-wrap items-center gap-2">
              {FILTERS.map((s) => (
                <button key={s} onClick={() => setFilter(s)}
                  className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
                    filter === s ? 'bg-navy-900 text-white shadow' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'
                  }`}>
                  {s === 'ALL' ? 'Tất cả' : STATUS_META[s].label}
                </button>
              ))}
            </div>

            {orders.length === 0 && <p className="mt-6 text-center text-slate-400">Bạn chưa gửi đơn nào.</p>}
            {orders.length > 0 && visible.length === 0 && <p className="mt-6 text-center text-slate-400">Không có đơn nào ở trạng thái này.</p>}

            <ul className="mt-4 space-y-4">
              {visible.map((o) => <OrderCard key={o.id} order={o} />)}
            </ul>
          </section>
        )}
      </main>
      <ChatWidget />
    </div>
  )
}

function OrderCard({ order: o }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(o.trackingNumber)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch { /* clipboard unavailable on plain http — ignore */ }
  }

  return (
    <li className="card animate-riseIn overflow-hidden">
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-mono text-sm font-bold text-slate-700">Đơn #{o.code}</p>
            <p className="text-xs text-slate-400">
              {o.paidAt ? `Thanh toán lúc ${fmtDate(o.paidAt)}` : `Tạo lúc ${fmtDate(o.confirmedAt || o.createdAt)}`} · {o.itemCount} sản phẩm · {o.totalQuantity} cái
              {o.status === 'CONFIRMED' && <span className="ml-2 font-medium text-sky-700">{o.paymentVerified ? '· Đã đối soát thanh toán' : '· Đang chờ nhân viên đối soát thanh toán'}</span>}
            </p>
          </div>
          <StatusBadge status={o.status} />
        </div>

        <ul className="mt-3 divide-y rounded-lg border">
          {o.items.map((i) => (
            <li key={i.id} className="flex gap-3 p-3 text-sm">
              <Thumb url={i.imageUrl} size={44} />
              <div className="min-w-0 flex-1">
                <p className="font-medium leading-snug">{i.title}</p>
                {i.customerNote && <p className="text-xs text-amber-700">{i.customerNote}</p>}
              </div>
              <div className="shrink-0 text-right text-xs text-slate-500">× {i.quantity}<div>{i.price != null ? money(i.price) : '—'}</div></div>
            </li>
          ))}
        </ul>

        <div className="mt-3 flex items-center justify-between text-sm">
          <span className="text-slate-500">Tạm tính</span>
          <span className="font-bold">{money(o.estimatedTotal)}</span>
        </div>

        <div className="mt-5"><ProgressTracker item={o} /></div>
      </div>

      {o.trackingNumber && (
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t bg-slate-50/70 px-5 py-3 text-sm">
          <div className="flex items-center gap-2">
            <Icon name="pin" size={16} className="text-accent-600" />
            <span className="text-slate-500">Mã vận đơn</span>
            <span className="font-mono font-semibold">{o.trackingNumber}</span>
            <button onClick={copy} className="rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700" title="Sao chép">
              <Icon name={copied ? 'check' : 'copy'} size={14} />
            </button>
          </div>
        </div>
      )}
    </li>
  )
}
