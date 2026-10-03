import Icon from './Icon'
import { STATUS_META } from './status'

export default function StatusBadge({ status }) {
  const m = STATUS_META[status]
  if (!m) return null
  return (
    <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${m.badge}`}>
      <Icon name={m.icon} size={13} />
      {m.label}
    </span>
  )
}
