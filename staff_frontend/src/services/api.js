import axios from 'axios'

const TOKEN_KEY = 'oa_staff_token'
const USER_KEY = 'oa_staff_user'

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
    const isLogin = err.config?.url?.includes('/auth/login')
    if ((status === 401 || status === 403) && !isLogin && auth.token()) {
      auth.clear()
      window.location.assign('/login')
    }
    return Promise.reject(err)
  }
)

export const errorMessage = (err) =>
  err.response?.data?.message || err.response?.data?.error || err.message || 'Something went wrong'

export const login = (email, password) => api.post('/auth/login', { email, password }).then((r) => r.data)
export const listItems = () => api.get('/staff/cart-items').then((r) => r.data)
export const updateItem = (id, patch) => api.patch(`/staff/cart-items/${id}`, patch).then((r) => r.data)
export const createStaff = (body) => api.post('/staff/users', body).then((r) => r.data)

export const STATUSES = ['NEW', 'PURCHASED', 'SHIPPED', 'DELIVERED', 'CANCELLED']

// Backend sends LocalDateTime (no zone) in UTC.
export const fmtDate = (s) => {
  if (!s) return '—'
  const d = new Date(/[zZ]|[+-]\d\d:?\d\d$/.test(s) ? s : s + 'Z')
  return d.toLocaleString()
}
