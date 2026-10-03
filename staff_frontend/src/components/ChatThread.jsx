import { useEffect, useRef, useState } from 'react'
import Icon from './Icon'

// Backend sends LocalDateTime (no zone) in UTC.
const toDate = (s) => new Date(/[zZ]|[+-]\d\d:?\d\d$/.test(s) ? s : s + 'Z')
const timeOf = (s) => toDate(s).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
const dayOf = (s) => toDate(s).toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit' })
const sameDay = (a, b) => toDate(a).toDateString() === toDate(b).toDateString()

// Message list + composer, shared by the customer site and the staff console.
// `viewerIsStaff` decides which side is "me" (right, orange) and which is "them" (left, white).
export default function ChatThread({ messages, viewerIsStaff, onSend, emptyText, error }) {
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const listRef = useRef(null)
  const stick = useRef(true) // keep the view pinned to the newest message unless the user scrolled up

  useEffect(() => {
    const el = listRef.current
    if (el && stick.current) el.scrollTop = el.scrollHeight
  }, [messages])

  const onScroll = () => {
    const el = listRef.current
    stick.current = el.scrollHeight - el.scrollTop - el.clientHeight < 60
  }

  const submit = async (e) => {
    e?.preventDefault()
    const value = text.trim()
    if (!value || sending) return
    setSending(true)
    try {
      await onSend(value)
      setText('')
      stick.current = true
    } catch { /* the parent shows the error */ } finally {
      setSending(false)
    }
  }

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) submit(e) // Shift+Enter = new line
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div ref={listRef} onScroll={onScroll} className="flex-1 space-y-2 overflow-y-auto bg-slate-50 p-3">
        {messages.length === 0 && <p className="mt-8 px-4 text-center text-sm text-slate-400">{emptyText}</p>}
        {messages.map((m, i) => {
          const mine = m.fromStaff === viewerIsStaff
          const newDay = i === 0 || !sameDay(messages[i - 1].createdAt, m.createdAt)
          return (
            <div key={m.id}>
              {newDay && <div className="my-2 text-center text-[11px] font-medium uppercase tracking-wide text-slate-400">{dayOf(m.createdAt)}</div>}
              <div className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] ${mine ? 'items-end' : 'items-start'} flex flex-col`}>
                  {!mine && <span className="mb-0.5 px-1 text-[11px] font-semibold text-slate-500">{m.senderName}{m.fromStaff ? ' · Hàng Về' : ''}</span>}
                  <div className={`whitespace-pre-wrap break-words rounded-2xl px-3 py-2 text-sm shadow-sm ${
                    mine ? 'rounded-br-md bg-accent-500 text-white' : 'rounded-bl-md border border-slate-200 bg-white text-navy-900'
                  }`}>{m.content}</div>
                  <span className="mt-0.5 px-1 text-[10px] text-slate-400">{timeOf(m.createdAt)}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {error && <p className="bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>}
      <form onSubmit={submit} className="flex items-end gap-2 border-t bg-white p-2.5">
        <textarea
          rows={1}
          value={text}
          maxLength={2000}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Nhập tin nhắn… (Enter để gửi)"
          className="max-h-28 min-h-[40px] flex-1 resize-none rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-500/25"
        />
        <button disabled={!text.trim() || sending} className="btn-primary h-10 px-3" aria-label="Gửi">
          <Icon name="send" size={18} />
        </button>
      </form>
    </div>
  )
}
