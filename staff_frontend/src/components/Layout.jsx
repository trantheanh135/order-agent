import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { auth } from '../services/api'

const link = ({ isActive }) =>
  `rounded px-3 py-1.5 text-sm font-medium ${isActive ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-200'}`

export default function Layout() {
  const navigate = useNavigate()
  const user = auth.user()

  const logout = () => {
    auth.clear()
    navigate('/login')
  }

  return (
    <div className="min-h-screen">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
          <span className="font-semibold">Order Agent · Staff</span>
          <nav className="flex gap-2">
            <NavLink to="/" end className={link}>Orders</NavLink>
            {user?.role === 'ADMIN' && <NavLink to="/staff" className={link}>Staff accounts</NavLink>}
          </nav>
          <div className="ml-auto flex items-center gap-3 text-sm text-slate-600">
            <span>{user?.name} <span className="text-xs text-slate-400">({user?.role})</span></span>
            <button onClick={logout} className="rounded border px-3 py-1 hover:bg-slate-100">Sign out</button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}
