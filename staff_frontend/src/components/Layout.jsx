import { useEffect, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { auth, chatUnread } from '../services/api'
import Icon from './Icon'
import Logo from './Logo'
import { GUIDE_URL } from '../config'

const ROLE_VI = { ADMIN: 'Quản trị viên', STAFF: 'Nhân viên' }

const desktopLink = ({ isActive }) =>
  `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
    isActive ? 'bg-white/10 text-white ring-1 ring-white/10' : 'text-sky-100/70 hover:bg-white/5 hover:text-white'
  }`

const mobileLink = ({ isActive }) =>
  `flex items-center gap-1.5 whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ${
    isActive ? 'bg-white/15 text-white' : 'text-sky-100/70'
  }`

export default function Layout() {
  const navigate = useNavigate()
  const user = auth.user()
  const isAdmin = user?.role === 'ADMIN'

  // Number of conversations waiting for a reply, shown next to "Tin nhắn".
  const [unreadChats, setUnreadChats] = useState(0)
  useEffect(() => {
    const check = () => chatUnread().then(setUnreadChats).catch(() => {})
    check()
    const id = setInterval(check, 10000)
    return () => clearInterval(id)
  }, [])
  const badge = unreadChats > 0 && (
    <span className="ml-auto flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-accent-500 px-1 text-[11px] font-bold text-white">{unreadChats}</span>
  )

  const logout = () => {
    auth.clear()
    navigate('/login')
  }

  return (
    <div className="min-h-screen md:flex">
      {/* Sidebar (desktop) */}
      <aside className="relative hidden w-64 shrink-0 flex-col overflow-hidden bg-navy-950 md:sticky md:top-0 md:flex md:h-screen">
        <div
          className="absolute inset-x-0 bottom-0 h-72 bg-cover bg-bottom opacity-50"
          style={{ backgroundImage: "url('/bg-port.svg')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-navy-950 via-navy-950/85 to-navy-950/10" />
        <div className="relative z-10 flex h-full flex-col p-4">
          <div className="px-1 py-2">
            <Logo label="Hàng Về" sub="Trang điều hành" />
          </div>
          <nav className="mt-6 space-y-1">
            <NavLink to="/" end className={desktopLink}><Icon name="package" size={18} /> Đơn hàng</NavLink>
            <NavLink to="/chat" className={desktopLink}><Icon name="chat" size={18} /> Tin nhắn {badge}</NavLink>
            {isAdmin && <NavLink to="/payment" className={desktopLink}><Icon name="qr" size={18} /> Thanh toán</NavLink>}
            {isAdmin && <NavLink to="/staff" className={desktopLink}><Icon name="users" size={18} /> Tài khoản nhân viên</NavLink>}
            <a href={GUIDE_URL} target="_blank" rel="noopener noreferrer" className={desktopLink({ isActive: false })}>
              <Icon name="play" size={18} /> Video hướng dẫn
            </a>
          </nav>

          <div className="mt-auto rounded-xl bg-white/10 p-3 text-sm text-white ring-1 ring-white/10 backdrop-blur">
            <div className="truncate font-semibold">{user?.name}</div>
            <div className="truncate text-xs text-sky-100/70">{user?.email}</div>
            <div className="mt-2 flex items-center justify-between">
              <span className="rounded-full bg-accent-500/20 px-2 py-0.5 text-[11px] font-semibold text-accent-400">{ROLE_VI[user?.role] || user?.role}</span>
              <button onClick={logout} className="flex items-center gap-1 text-xs text-sky-100/80 hover:text-white">
                <Icon name="logout" size={14} /> Đăng xuất
              </button>
            </div>
          </div>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        {/* Top bar (mobile) */}
        <header className="flex items-center gap-3 bg-navy-950 px-4 py-3 md:hidden">
          <Logo size={32} />
          <nav className="ml-auto flex gap-1">
            <NavLink to="/" end className={mobileLink}><Icon name="package" size={16} /> Đơn hàng</NavLink>
            <NavLink to="/chat" className={mobileLink}><Icon name="chat" size={16} /> Tin nhắn {unreadChats > 0 && <b className="rounded-full bg-accent-500 px-1.5 text-[11px] text-white">{unreadChats}</b>}</NavLink>
            {isAdmin && <NavLink to="/staff" className={mobileLink}><Icon name="users" size={16} /> Nhân sự</NavLink>}
            <button onClick={logout} className="px-2 text-sky-100/70" aria-label="Đăng xuất"><Icon name="logout" size={18} /></button>
          </nav>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
