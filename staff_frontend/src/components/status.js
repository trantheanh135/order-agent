// Shipment lifecycle: NEW -> PURCHASED -> SHIPPED -> DELIVERED (CANCELLED can happen at any point).
export const FLOW = ['NEW', 'PURCHASED', 'SHIPPED', 'DELIVERED']

export const STATUS_META = {
  NEW: {
    label: 'New', step: 'Added', icon: 'package', stamp: 'createdAt',
    badge: 'bg-sky-50 text-sky-700 ring-sky-200', tile: 'bg-sky-100 text-sky-600', bar: 'bg-sky-500',
  },
  PURCHASED: {
    label: 'Purchased', step: 'Purchased', icon: 'cart', stamp: 'purchasedAt',
    badge: 'bg-amber-50 text-amber-700 ring-amber-200', tile: 'bg-amber-100 text-amber-600', bar: 'bg-amber-500',
  },
  SHIPPED: {
    label: 'In transit', step: 'In transit', icon: 'truck', stamp: 'shippedAt',
    badge: 'bg-violet-50 text-violet-700 ring-violet-200', tile: 'bg-violet-100 text-violet-600', bar: 'bg-violet-500',
  },
  DELIVERED: {
    label: 'Delivered', step: 'Delivered', icon: 'warehouse', stamp: 'deliveredAt',
    badge: 'bg-emerald-50 text-emerald-700 ring-emerald-200', tile: 'bg-emerald-100 text-emerald-600', bar: 'bg-emerald-500',
  },
  CANCELLED: {
    label: 'Cancelled', step: 'Cancelled', icon: 'ban', stamp: null,
    badge: 'bg-slate-100 text-slate-600 ring-slate-200', tile: 'bg-slate-200 text-slate-500', bar: 'bg-slate-400',
  },
}

export const nextStatus = (status) => FLOW[FLOW.indexOf(status) + 1] || null

// Backend sends LocalDateTime (no zone) in UTC.
const toDate = (s) => new Date(/[zZ]|[+-]\d\d:?\d\d$/.test(s) ? s : s + 'Z')
export const shortDate = (s) =>
  s ? toDate(s).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : ''
