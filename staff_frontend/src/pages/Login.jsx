import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth, login, errorMessage } from '../services/api'
import AuthShell from '../components/AuthShell'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      const data = await login(email.trim(), password)
      if (data.role === 'CUSTOMER') {
        setError('Trang này dành cho nhân viên. Khách hàng vui lòng dùng trang khách hàng.')
        return
      }
      auth.save(data)
      navigate('/')
    } catch (err) {
      const status = err.response?.status
      setError(status === 401 || status === 400 ? 'Email hoặc mật khẩu không đúng' : errorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthShell
      title="Đưa mọi đơn hàng từ giỏ hàng đến tận tay khách."
      subtitle="Bảng điều khiển cho nhân viên order hộ: xem đơn mới, mua hàng, vận chuyển và theo dõi — tất cả trong một hàng đợi."
      bullets={[
        ['cart', 'Xem các sản phẩm khách thêm từ 1688 & Taobao'],
        ['truck', 'Cập nhật trạng thái và mã vận đơn chỉ với một cú nhấp'],
        ['warehouse', 'Giúp khách nắm tình trạng đơn cho đến khi nhận hàng'],
      ]}
    >
      <form onSubmit={submit} className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-navy-900">Đăng nhập nhân viên</h2>
          <p className="text-sm text-slate-500">Dùng tài khoản nhân viên hoặc quản trị viên.</p>
        </div>
        {error && <p className="rounded-lg bg-red-50 p-2.5 text-sm text-red-700 ring-1 ring-red-100">{error}</p>}
        <label className="block text-sm font-medium text-navy-800">Email
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
            className="field" autoComplete="username" />
        </label>
        <label className="block text-sm font-medium text-navy-800">Mật khẩu
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
            className="field" autoComplete="current-password" />
        </label>
        <button disabled={busy} className="btn-primary w-full py-2.5">{busy ? 'Đang đăng nhập…' : 'Đăng nhập'}</button>
      </form>
    </AuthShell>
  )
}
