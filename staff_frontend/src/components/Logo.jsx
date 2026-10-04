export default function Logo({ size = 36, label, sub, dark = true }) {
  return (
    <div className="flex items-center gap-3">
      <img src={`${import.meta.env.BASE_URL}favicon.svg`} width={size} height={size} alt="" className="rounded-xl shadow-md" />
      {label && (
        <div className="whitespace-nowrap leading-tight">
          <div className={`text-base font-bold tracking-tight ${dark ? 'text-white' : 'text-navy-900'}`}>{label}</div>
          {sub && <div className={`text-[11px] uppercase tracking-widest ${dark ? 'text-accent-400' : 'text-accent-600'}`}>{sub}</div>}
        </div>
      )}
    </div>
  )
}
