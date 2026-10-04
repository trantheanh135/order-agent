import { useState } from 'react'
import Icon from './Icon'
import Thumb from './Thumb'
import StatusBadge from './StatusBadge'
import { money, vnd } from './status'

// Payment step of a confirmed order: QR code + amount + transfer content, then "I have paid".
export default function PaymentCard({ order, info, busy, onPaid, onCancel }) {
  const [copied, setCopied] = useState('')
  const copy = async (key, text) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(key)
      setTimeout(() => setCopied(''), 1500)
    } catch { /* clipboard unavailable on plain http — ignore */ }
  }

  const amountVnd = vnd(order.estimatedTotal, info?.exchangeRate)

  return (
    <div className="card overflow-hidden border-2 border-orange-300">
      <div className="flex flex-wrap items-center gap-3 border-b bg-orange-50 px-5 py-3">
        <Icon name="qr" className="text-orange-600" />
        <div>
          <p className="font-bold text-orange-900">Thanh toán đơn #{order.code}</p>
          <p className="text-xs text-orange-800/80">Chuyển khoản xong hãy bấm “Tôi đã thanh toán”. Nhân viên chỉ nhìn thấy và xử lý đơn sau bước này.</p>
        </div>
        <span className="ml-auto"><StatusBadge status="AWAITING_PAYMENT" /></span>
      </div>

      <div className="grid gap-5 p-5 md:grid-cols-[15rem_1fr]">
        {/* QR */}
        <div className="text-center">
          {info?.qrImage ? (
            <img src={info.qrImage} alt="Mã QR thanh toán" className="mx-auto w-56 rounded-xl border bg-white p-2 shadow-sm" />
          ) : (
            <div className="mx-auto flex h-56 w-56 flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
              <Icon name="qr" size={36} />
              Chưa có mã QR. Vui lòng nhắn tin cho Hàng Về để được hướng dẫn thanh toán.
            </div>
          )}
          <p className="mt-2 text-xs text-slate-400">Quét bằng ứng dụng ngân hàng</p>
        </div>

        {/* Details */}
        <div className="space-y-3 text-sm">
          <div className="rounded-lg bg-slate-50 p-3">
            <p className="text-xs text-slate-500">Số tiền cần chuyển {amountVnd ? '(tạm tính)' : ''}</p>
            {amountVnd ? (
              <>
                <p className="text-2xl font-extrabold text-navy-900">{amountVnd}</p>
                <p className="text-xs text-slate-500">≈ {money(order.estimatedTotal)} · tỷ giá {Number(info.exchangeRate).toLocaleString('vi-VN')} ₫/¥</p>
              </>
            ) : (
              <>
                <p className="text-2xl font-extrabold text-navy-900">{money(order.estimatedTotal)}</p>
                <p className="text-xs text-slate-500">Chưa có tỷ giá: hãy hỏi nhân viên số tiền VNĐ chính xác qua chat.</p>
              </>
            )}
            {order.unpricedItems > 0 && <p className="mt-1 text-xs text-amber-600">{order.unpricedItems} sản phẩm chưa có giá, nhân viên sẽ báo thêm.</p>}
          </div>

          <div className="rounded-lg bg-slate-50 p-3">
            <p className="text-xs text-slate-500">Nội dung chuyển khoản (bắt buộc ghi đúng)</p>
            <div className="flex items-center gap-2">
              <span className="font-mono text-lg font-bold tracking-wider">{order.paymentCode}</span>
              <button onClick={() => copy('code', order.paymentCode)} className="rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700" title="Sao chép">
                <Icon name={copied === 'code' ? 'check' : 'copy'} size={15} />
              </button>
            </div>
          </div>

          {info?.instructions && (
            <div className="rounded-lg border p-3">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Thông tin chuyển khoản</p>
              <p className="whitespace-pre-wrap text-slate-700">{info.instructions}</p>
            </div>
          )}

          <details className="rounded-lg border">
            <summary className="cursor-pointer px-3 py-2 text-slate-600">Xem lại {order.itemCount} sản phẩm · {order.totalQuantity} cái</summary>
            <ul className="divide-y border-t">
              {order.items.map((i) => (
                <li key={i.id} className="flex items-center gap-3 p-2.5">
                  <Thumb url={i.imageUrl} size={40} />
                  <span className="min-w-0 flex-1 truncate">{i.title}</span>
                  <span className="text-xs text-slate-500">× {i.quantity}</span>
                </li>
              ))}
            </ul>
          </details>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t bg-slate-50 px-5 py-4">
        <button disabled={busy} onClick={onCancel} className="btn-ghost text-red-600">Hủy đơn</button>
        <button disabled={busy} onClick={onPaid} className="btn-primary ml-auto">
          <Icon name="check" size={16} /> Tôi đã thanh toán
        </button>
      </div>
    </div>
  )
}
