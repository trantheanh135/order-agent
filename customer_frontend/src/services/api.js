import axios from 'axios'

const TOKEN_KEY = 'oa_customer_token'
const USER_KEY = 'oa_customer_user'

export const auth = {
  token: () => localStorage.getItem(TOKEN_KEY),
  user: () => {
    try { return JSON.parse(localStorage.getItem(USER_KEY)) } catch { return null }
  },
  save: (data) => {
    localStorage.setItem(TOKEN_KEY, data.token)
    localStorage.setItem(USER_KEY, JSON.stringify({ name: data.name, email: data.email, role: data.role }))
  },
  clear: () => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  },
}

const api = axios.create({ baseURL: '/api' })

api.interceptors.request.use((config) => {
  const token = auth.token()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// The backend answers 403 (not 401) for a missing/expired token, so treat both as "signed out".
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status
    const isAuthCall = err.config?.url?.includes('/auth/')
    if ((status === 401 || status === 403) && !isAuthCall && auth.token()) {
      auth.clear()
      window.location.assign('/login')
    }
    return Promise.reject(err)
  }
)

const VI_MESSAGES = {
  'Invalid email or password': 'Email hoặc mật khẩu không đúng',
  'Email already registered': 'Email này đã được đăng ký',
  'Email is required': 'Vui lòng nhập email',
  'Email must be valid': 'Email không hợp lệ',
  'Name is required': 'Vui lòng nhập họ tên',
  'Password is required': 'Vui lòng nhập mật khẩu',
  'Password must be at least 8 characters': 'Mật khẩu phải có ít nhất 8 ký tự',
  'Use /api/auth/register for customer accounts': 'Tài khoản khách hàng phải đăng ký ở trang khách hàng',
}

const VI_BY_STATUS = {
  400: 'Dữ liệu không hợp lệ, vui lòng kiểm tra lại.',
  401: 'Phiên đăng nhập không hợp lệ, vui lòng đăng nhập lại.',
  403: 'Bạn không có quyền thực hiện thao tác này.',
  404: 'Không tìm thấy dữ liệu.',
  409: 'Dữ liệu bị trùng.',
}

// Backend messages are English; the UI always shows Vietnamese.
export const errorMessage = (err) => {
  if (!err.response) return 'Không thể kết nối tới máy chủ. Vui lòng thử lại.'
  const { status, data } = err.response
  const raw = data?.validationErrors?.[0]?.message || data?.message
  if (raw && VI_MESSAGES[raw]) return VI_MESSAGES[raw]
  if (VI_BY_STATUS[status]) return VI_BY_STATUS[status]
  return status >= 500 ? 'Máy chủ gặp lỗi, vui lòng thử lại sau.' : 'Đã xảy ra lỗi, vui lòng thử lại.'
}

export const login = (email, password) => api.post('/auth/login', { email, password }).then((r) => r.data)
export const register = (name, email, password) =>
  api.post('/auth/register', { name, email, password }).then((r) => r.data)
// The customer works on ONE open order (status NEW). Staff only see it after confirmCurrentOrder().
export const getCurrentOrder = () => api.get('/orders/current').then((r) => r.data)
export const updateCurrentItem = (itemId, quantity) => api.patch(`/orders/current/items/${itemId}`, { quantity }).then((r) => r.data)
export const removeCurrentItem = (itemId) => api.delete(`/orders/current/items/${itemId}`).then((r) => r.data)
export const discardCurrentOrder = () => api.delete('/orders/current').then((r) => r.data)
export const confirmCurrentOrder = () => api.post('/orders/current/confirm').then((r) => r.data)
export const listMyOrders = () => api.get('/orders/me').then((r) => r.data)

// Support chat with the Hàng Về team. `after` = cursor for polling; markRead = the chat window is open.
export const chatThread = (after, markRead) =>
  api.get('/chat', { params: { ...(after ? { after } : {}), markRead: !!markRead } }).then((r) => r.data)
export const chatSend = (content) => api.post('/chat/messages', { content }).then((r) => r.data)
export const chatUnread = () => api.get('/chat/unread').then((r) => r.data.unread)

export const STATUSES = ['NEW', 'PURCHASED', 'SHIPPED', 'DELIVERED', 'CANCELLED']

// Backend sends LocalDateTime (no zone) in UTC.
export const fmtDate = (s) => {
  if (!s) return '—'
  const d = new Date(/[zZ]|[+-]\d\d:?\d\d$/.test(s) ? s : s + 'Z')
  return d.toLocaleString('vi-VN')
}
