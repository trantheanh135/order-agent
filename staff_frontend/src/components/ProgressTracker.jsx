import Icon from './Icon'
import { FLOW, STATUS_META, shortDate } from './status'

// Parcel-tracking style stepper. `compact` renders a slim 4-segment bar for table rows.
export default function ProgressTracker({ item, compact = false }) {
  const cancelled = item.status === 'CANCELLED'
  const index = FLOW.indexOf(item.status)

  if (compact) {
    return (
      <div className="flex w-28 gap-1" title={STATUS_META[item.status]?.label}>
        {FLOW.map((s, i) => (
          <span
            key={s}
            className={`h-1.5 flex-1 rounded-full ${cancelled ? 'bg-slate-200' : i <= index ? 'bg-accent-500' : 'bg-slate-200'}`}
          />
        ))}
      </div>
    )
  }

  if (cancelled) {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-600">
        <Icon name="ban" size={16} /> Món hàng này đã bị hủy.
      </div>
    )
  }

  return (
    <ol className="flex items-start">
      {FLOW.map((s, i) => {
        const m = STATUS_META[s]
        const done = i < index
        const current = i === index
        return (
          <li key={s} className="relative flex flex-1 flex-col items-center text-center">
            {i > 0 && (
              <span className={`absolute right-1/2 top-4 h-0.5 w-full -translate-y-1/2 ${i <= index ? 'bg-accent-500' : 'bg-slate-200'}`} />
            )}
            <span
              className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 transition ${
                done
                  ? 'border-accent-500 bg-accent-500 text-white'
                  : current
                    ? 'border-accent-500 bg-white text-accent-600 ring-4 ring-accent-500/20'
                    : 'border-slate-200 bg-white text-slate-300'
              }`}
            >
              <Icon name={done ? 'check' : m.icon} size={16} />
            </span>
            <span className={`mt-1.5 text-[11px] font-semibold leading-tight ${i <= index ? 'text-navy-800' : 'text-slate-400'}`}>
              {m.step}
            </span>
            <span className="text-[10px] leading-tight text-slate-400">{shortDate(item[m.stamp]) || ' '}</span>
          </li>
        )
      })}
    </ol>
  )
}
