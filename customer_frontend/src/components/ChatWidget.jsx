import { useCallback, useEffect, useRef, useState } from 'react'
import { chatThread, chatSend, chatUnread, errorMessage } from '../services/api'
import ChatThread from './ChatThread'
import Icon from './Icon'
import Logo from './Logo'

const OPEN_POLL_MS = 3000   // while the window is open
const CLOSED_POLL_MS = 20000 // unread badge while it is closed

// Floating support chat with the Hàng Về team (bottom-right of the customer site).
export default function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [unread, setUnread] = useState(0)
  const [error, setError] = useState('')
  const cursor = useRef(null) // createdAt of the newest message we have

  // Merge new messages, de-duplicating by id (the server cursor is inclusive on purpose).
  const merge = useCallback((incoming) => {
    if (!incoming.length) return
    setMessages((prev) => {
      const seen = new Set(prev.map((m) => m.id))
      const added = incoming.filter((m) => !seen.has(m.id))
      return added.length ? [...prev, ...added] : prev
    })
    cursor.current = incoming[incoming.length - 1].createdAt
  }, [])

  const poll = useCallback(async () => {
    try {
      const t = await chatThread(cursor.current, true)
      merge(t.messages)
      setUnread(0)
      setError('')
    } catch (err) {
      setError(errorMessage(err))
    }
  }, [merge])

  // Window open: load the thread, then keep polling.
  useEffect(() => {
    if (!open) return undefined
    poll()
    const id = setInterval(poll, OPEN_POLL_MS)
    return () => clearInterval(id)
  }, [open, poll])

  // Window closed: only the unread badge.
  useEffect(() => {
    if (open) return undefined
    const check = () => chatUnread().then(setUnread).catch(() => {})
    check()
    const id = setInterval(check, CLOSED_POLL_MS)
    return () => clearInterval(id)
  }, [open])

  const send = async (content) => {
    setError('')
    try {
      merge([await chatSend(content)])
    } catch (err) {
      setError(errorMessage(err))
      throw err
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-30 flex flex-col items-end gap-3">
      {open && (
        <section className="flex h-[30rem] w-[22rem] max-w-[calc(100vw-2.5rem)] animate-riseIn flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5">
          <header className="flex items-center gap-3 bg-gradient-to-br from-navy-950 to-navy-800 px-4 py-3 text-white">
            <Logo size={30} />
            <div className="leading-tight">
              <div className="text-sm font-bold">Chat với Hàng Về</div>
              <div className="text-[11px] text-sky-100/70">Hỏi về đơn hàng, giá, vận chuyển…</div>
            </div>
            <button onClick={() => setOpen(false)} className="ml-auto rounded-lg p-1.5 text-sky-100/80 hover:bg-white/10" aria-label="Đóng"><Icon name="x" size={18} /></button>
          </header>
          <div className="min-h-0 flex-1">
            <ChatThread
              messages={messages}
              viewerIsStaff={false}
              onSend={send}
              error={error}
              emptyText="Chưa có tin nhắn. Hãy hỏi chúng tôi về đơn hàng, giá hoặc vận chuyển, nhân viên sẽ trả lời sớm."
            />
          </div>
        </section>
      )}

      <button
        onClick={() => setOpen((o) => !o)}
        className="relative flex h-14 w-14 items-center justify-center rounded-full bg-accent-500 text-white shadow-xl transition hover:scale-105 hover:bg-accent-600"
        aria-label="Chat với Hàng Về"
      >
        <Icon name={open ? 'x' : 'chat'} size={26} />
        {!open && unread > 0 && (
          <span className="absolute -right-1 -top-1 flex h-6 min-w-[1.5rem] items-center justify-center rounded-full border-2 border-white bg-red-600 px-1 text-xs font-bold">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>
    </div>
  )
}
