// Order lifecycle:
//   NEW (open order, only the customer sees it) -> CONFIRMED (customer confirmed; staff see it)
//   -> PURCHASED -> SHIPPED -> DELIVERED, or CANCELLED after confirmation.
// FLOW is the part that staff process and that the progress tracker draws.
export const FLOW = ['CONFIRMED', 'PURCHASED', 'SHIPPED', 'DELIVERED']

export const STATUS_META = {
  NEW: {
    label: 'Đang soạn', step: 'Đang soạn', icon: 'cart', stamp: 'createdAt',
    badge: 'bg-slate-100 text-slate-700 ring-slate-300', tile: 'bg-slate-200 text-slate-600', bar: 'bg-slate-400',
  },
  CONFIRMED: {
    label: 'Đã xác nhận', step: 'Đã xác nhận', icon: 'inbox', stamp: 'confirmedAt',
    badge: 'bg-sky-50 text-sky-700 ring-sky-200', tile: 'bg-sky-100 text-sky-600', bar: 'bg-sky-500',
  },
  PURCHASED: {
    label: 'Đã mua', step: 'Đã mua', icon: 'cart', stamp: 'purchasedAt',
    badge: 'bg-amber-50 text-amber-700 ring-amber-200', tile: 'bg-amber-100 text-amber-600', bar: 'bg-amber-500',
  },
  SHIPPED: {
    label: 'Đang vận chuyển', step: 'Vận chuyển', icon: 'truck', stamp: 'shippedAt',
    badge: 'bg-violet-50 text-violet-700 ring-violet-200', tile: 'bg-violet-100 text-violet-600', bar: 'bg-violet-500',
  },
  DELIVERED: {
    label: 'Đã giao', step: 'Đã giao', icon: 'warehouse', stamp: 'deliveredAt',
    badge: 'bg-emerald-50 text-emerald-700 ring-emerald-200', tile: 'bg-emerald-100 text-emerald-600', bar: 'bg-emerald-500',
  },
  CANCELLED: {
    label: 'Đã hủy', step: 'Đã hủy', icon: 'ban', stamp: null,
    badge: 'bg-slate-100 text-slate-600 ring-slate-200', tile: 'bg-slate-200 text-slate-500', bar: 'bg-slate-400',
  },
}

export const nextStatus = (status) => FLOW[FLOW.indexOf(status) + 1] || null

// Backend sends LocalDateTime (no zone) in UTC.
const toDate = (s) => new Date(/[zZ]|[+-]\d\d:?\d\d$/.test(s) ? s : s + 'Z')
export const shortDate = (s) =>
  s ? toDate(s).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }) : ''

// The extension tags categories in English; the UI shows Vietnamese.
const CATEGORY_VI = {
  Electronics: 'Điện tử', Clothing: 'Thời trang', Home: 'Đồ gia dụng', Beauty: 'Làm đẹp',
  Toys: 'Đồ chơi', Packaging: 'Bao bì', Uncategorized: 'Chưa phân loại',
}
export const categoryLabel = (c) => (c ? CATEGORY_VI[c] || c : '')

export const money = (n) => (n == null ? '—' : `¥${Number(n).toLocaleString('vi-VN', { maximumFractionDigits: 2 })}`)
