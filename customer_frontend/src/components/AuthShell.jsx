import Icon from './Icon'
import Logo from './Logo'

// Full-screen port illustration with a hero message on the left and the form card on the right.
export default function AuthShell({ title, subtitle, bullets = [], children }) {
  return (
    <div
      className="relative min-h-screen overflow-hidden bg-navy-950 bg-cover bg-center"
      style={{ backgroundImage: "url('/bg-port.svg')" }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-navy-950/95 via-navy-950/70 to-navy-950/10" />
      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-8">
        <Logo label="Hàng Về" sub="Mua hộ & vận chuyển" size={40} />

        <div className="flex flex-1 flex-col items-center justify-center gap-12 py-10 lg:flex-row lg:justify-between">
          <div className="max-w-lg animate-riseIn text-white">
            <h1 className="text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">{title}</h1>
            <p className="mt-3 text-base text-sky-100/80">{subtitle}</p>
            <ul className="mt-6 hidden space-y-3 sm:block">
              {bullets.map(([icon, text]) => (
                <li key={text} className="flex items-center gap-3 text-sm text-sky-50/90">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-accent-400 ring-1 ring-white/15 backdrop-blur">
                    <Icon name={icon} size={18} />
                  </span>
                  {text}
                </li>
              ))}
            </ul>
          </div>

          <div className="w-full max-w-sm animate-riseIn rounded-2xl border border-white/20 bg-white/95 p-7 shadow-2xl backdrop-blur-md [animation-delay:120ms]">
            {children}
          </div>
        </div>

        <p className="text-center text-xs text-sky-200/50">© Hàng Về · Mua hàng 1688 & Taobao, giao tận nơi</p>
      </div>
    </div>
  )
}
