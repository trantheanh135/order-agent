import { useCallback, useEffect, useRef, useState } from 'react'
import { chatInbox, chatThread, chatSend, errorMessage } from '../services/api'
import ChatThread from '../components/ChatThread'
import Icon from '../components/Icon'

const INBOX_POLL_MS = 5000
const THREAD_POLL_MS = 3000

const toDate = (s) => new Date(/[zZ]|[+-]\d\d:?\d\d$/.test(s) ? s : s + 'Z')
const when = (s) => {
  const d = toDate(s)
  return d.toDateString() === new Date().toDateString()
    ? d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    : d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
}

// Shared support inbox: every customer who wrote to us, newest first, with unread counts.
export default function Chat() {
  const [inbox, setInbox] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState(null)
  const [messages, setMessages] = useState([])
  const [error, setError] = useState('')
  const cursor = useRef(null)

  const loadInbox = useCallback(async () => {
    try {
      setInbox(await chatInbox())
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadInbox()
    const id = setInterval(loadInbox, INBOX_POLL_MS)
    return () => clearInterval(id)
  }, [loadInbox])

  // Open thread: load it, then poll for new messages (and keep it marked as read).
  useEffect(() => {
    setMessages([])
    cursor.current = null
    if (!selectedId) return undefined
    let cancelled = false
    const poll = async () => {
      try {
        const t = await chatThread(selectedId, cursor.current, true)
        if (cancelled || !t.messages.length) return
        setMessages((prev) => {
          const seen = new Set(prev.map((m) => m.id))
          const added = t.messages.filter((m) => !seen.has(m.id))
          return added.length ? [...prev, ...added] : prev
        })
        cursor.current = t.messages[t.messages.length - 1].createdAt
        setError('')
      } catch (err) {
        if (!cancelled) setError(errorMessage(err))
      }
    }
    poll()
    const id = setInterval(poll, THREAD_POLL_MS)
    return () => { cancelled = true; clearInterval(id) }
  }, [selectedId])

  const send = async (content) => {
    setError('')
    try {
      const m = await chatSend(selectedId, content)
      setMessages((prev) => (prev.some((x) => x.id === m.id) ? prev : [...prev, m]))
      cursor.current = m.createdAt
      loadInbox()
    } catch (err) {
      setError(errorMessage(err))
      throw err
    }
  }

  const selected = inbox.find((c) => c.id === selectedId)

  return (
    <div className="animate-fadeIn">
      <div className="mb-4">
        <h1 className="text-2xl font-bold tracking-tight">Tin nhắn</h1>
        <p className="text-sm text-slate-500">Hộp thư hỗ trợ chung của nhân viên và quản trị viên · tự cập nhật</p>
      </div>

      <div className="card grid h-[calc(100vh-11rem)] min-h-[28rem] overflow-hidden md:grid-cols-[20rem_1fr]">
        {/* Conversations */}
        <aside className={`${selectedId ? 'hidden md:block' : ''} overflow-y-auto border-r`}>
          {loading && <p className="p-6 text-center text-sm text-slate-400">Đang tải…</p>}
          {!loading && inbox.length === 0 && (
            <div className="p-8 text-center text-sm text-slate-400">
              <Icon name="chat" size={36} className="mx-auto mb-2" />
              Chưa có khách nào nhắn tin.
            </div>
          )}
          <ul>
            {inbox.map((c) => (
              <li key={c.id}>
                <button onClick={() => setSelectedId(c.id)}
                  className={`flex w-full gap-3 border-b border-slate-100 px-4 py-3 text-left transition hover:bg-sky-50/60 ${c.id === selectedId ? 'bg-sky-50' : ''}`}>
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-navy-900 text-sm font-bold text-white">
                    {(c.customerName || '?').trim().slice(0, 1).toUpperCase()}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline justify-between gap-2">
                      <span className={`truncate text-sm ${c.unread ? 'font-bold' : 'font-medium'}`}>{c.customerName}</span>
                      <span className="shrink-0 text-[11px] text-slate-400">{when(c.lastMessageAt)}</span>
                    </span>
                    <span className="flex items-center justify-between gap-2">
                      <span className={`truncate text-xs ${c.unread ? 'font-semibold text-navy-900' : 'text-slate-500'}`}>{c.lastMessagePreview}</span>
                      {c.unread > 0 && <span className="flex h-5 min-w-[1.25rem] shrink-0 items-center justify-center rounded-full bg-accent-500 px-1 text-[11px] font-bold text-white">{c.unread}</span>}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        {/* Thread */}
        <section className={`${selectedId ? '' : 'hidden md:flex'} min-h-0 flex-col md:flex`}>
          {!selected ? (
            <div className="m-auto p-8 text-center text-slate-400">
              <Icon name="chat" size={40} className="mx-auto mb-2" />
              Chọn một cuộc trò chuyện ở bên trái.
            </div>
          ) : (
            <>
              <header className="flex items-center gap-3 border-b bg-white px-4 py-3">
                <button onClick={() => setSelectedId(null)} className="rounded p-1 text-slate-500 hover:bg-slate-100 md:hidden" aria-label="Quay lại">←</button>
                <div className="min-w-0">
                  <div className="truncate font-semibold">{selected.customerName}</div>
                  <div className="truncate text-xs text-slate-400">{selected.customerEmail}</div>
                </div>
              </header>
              <div className="min-h-0 flex-1">
                <ChatThread messages={messages} viewerIsStaff onSend={send} error={error} emptyText="Chưa có tin nhắn." />
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  )
}
