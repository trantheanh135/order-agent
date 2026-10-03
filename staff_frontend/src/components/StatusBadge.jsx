const COLORS = {
  NEW: 'bg-blue-100 text-blue-800',
  PURCHASED: 'bg-amber-100 text-amber-800',
  SHIPPED: 'bg-violet-100 text-violet-800',
  DELIVERED: 'bg-emerald-100 text-emerald-800',
  CANCELLED: 'bg-slate-200 text-slate-600',
}

export default function StatusBadge({ status }) {
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${COLORS[status] || ''}`}>
      {status}
    </span>
  )
}
