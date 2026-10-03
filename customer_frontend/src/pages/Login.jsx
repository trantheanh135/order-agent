import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { auth, login, register, errorMessage } from '../services/api'
import AuthShell from '../components/AuthShell'

export default function Login({ register: isRegister = false }) {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      const data = isRegister
        ? await register(name.trim(), email.trim(), password)
        : await login(email.trim(), password)
      if (data.role !== 'CUSTOMER') {
        setError('Trang này dành cho khách hàng. Nhân viên vui lòng dùng trang quản trị.')
        return
      }
      auth.save(data)
      navigate('/')
    } catch (err) {
      const status = err.response?.status
      if (!isRegister && (status === 401 || status === 400)) setError('Email hoặc mật khẩu không đúng')
      else if (isRegister && status === 409) setError('Email này đã được đăng ký')
      else setError(errorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthShell
      title="Mua sắm 1688 & Taobao. Theo dõi từng kiện hàng."
      subtitle="Cứ thêm sản phẩm vào giỏ khi bạn lướt web — chúng tôi mua hàng, vận chuyển và cập nhật tình trạng từ kho đến tận nhà bạn."
      bullets={[
        ['cart', 'Sản phẩm được tiện ích trình duyệt ghi nhận tự động'],
        ['ship', 'Theo dõi từng đơn từ lúc mua đến khi giao'],
        ['pin', 'Xem mã vận đơn ngay khi có'],
      ]}
    >
      <form onSubmit={submit} className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-navy-900">{isRegister ? 'Tạo tài khoản' : 'Chào mừng trở lại'}</h2>
          <p className="text-sm text-slate-500">{isRegister ? 'Chỉ mất chưa đến một phút.' : 'Đăng nhập để xem đơn hàng của bạn.'}</p>
        </div>
        {error && <p className="rounded-lg bg-red-50 p-2.5 text-sm text-red-700 ring-1 ring-red-100">{error}</p>}
        {isRegister && (
          <label className="block text-sm font-medium text-navy-800">Họ tên
            <input required value={name} onChange={(e) => setName(e.target.value)} className="field" />
          </label>
        )}
        <label className="block text-sm font-medium text-navy-800">Email
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
            className="field" autoComplete="username" />
        </label>
        <label className="block text-sm font-medium text-navy-800">Mật khẩu{isRegister && <span className="font-normal text-slate-400"> (tối thiểu 8 ký tự)</span>}
          <input type="password" required minLength={isRegister ? 8 : undefined} value={password}
            onChange={(e) => setPassword(e.target.value)} className="field"
            autoComplete={isRegister ? 'new-password' : 'current-password'} />
        </label>
        <button disabled={busy} className="btn-primary w-full py-2.5">
          {busy ? 'Vui lòng đợi…' : isRegister ? 'Tạo tài khoản' : 'Đăng nhập'}
        </button>
        <p className="text-center text-sm text-slate-500">
          {isRegister
            ? <>Đã có tài khoản? <Link to="/login" className="font-semibold text-accent-600 hover:underline">Đăng nhập</Link></>
            : <>Chưa có tài khoản? <Link to="/register" className="font-semibold text-accent-600 hover:underline">Đăng ký</Link></>}
        </p>
      </form>
    </AuthShell>
  )
}
