import { useEffect, useRef, useState } from 'react'
import { getPaymentInfo, savePaymentSettings, errorMessage, fmtDate } from '../services/api'
import Icon from '../components/Icon'

const MAX_SIDE = 640 // px: a QR code stays sharp and the upload stays small (tens of KB)

// Read an image file, scale it down to MAX_SIDE and return a PNG data URL.
function toSmallPng(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      const scale = Math.min(1, MAX_SIDE / Math.max(img.width, img.height))
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(img.width * scale)
      canvas.height = Math.round(img.height * scale)
      const ctx = canvas.getContext('2d')
      ctx.fillStyle = '#fff' // transparent QR images would turn black otherwise
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL('image/png'))
    }
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Không đọc được file ảnh này.')) }
    img.src = url
  })
}

// Admin only: where the payment QR code, the transfer instructions and the exchange rate are set.
export default function Payment() {
  const [qr, setQr] = useState(null)
  const [instructions, setInstructions] = useState('')
  const [rate, setRate] = useState('')
  const [updatedAt, setUpdatedAt] = useState(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState(null)
  const fileRef = useRef(null)

  useEffect(() => {
    getPaymentInfo()
      .then((p) => { setQr(p.qrImage); setInstructions(p.instructions || ''); setRate(p.exchangeRate ?? ''); setUpdatedAt(p.updatedAt) })
      .catch((err) => setMsg({ ok: false, text: errorMessage(err) }))
      .finally(() => setLoading(false))
  }, [])

  const pick = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setMsg(null)
    try {
      setQr(await toSmallPng(file))
    } catch (err) {
      setMsg({ ok: false, text: err.message })
    }
  }

  const save = async (e) => {
    e.preventDefault()
    setBusy(true)
    setMsg(null)
    try {
      const p = await savePaymentSettings({
        qrImage: qr || '',
        instructions,
        exchangeRate: rate === '' ? null : Number(rate),
      })
      setUpdatedAt(p.updatedAt)
      setMsg({ ok: true, text: 'Đã lưu. Khách hàng sẽ thấy thông tin này ở bước thanh toán.' })
    } catch (err) {
      setMsg({ ok: false, text: errorMessage(err) })
    } finally {
      setBusy(false)
    }
  }

  const exampleVnd = rate ? Math.round(100 * Number(rate)).toLocaleString('vi-VN') : null

  return (
    <div className="max-w-3xl animate-riseIn">
      <div className="mb-6 flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-navy-900 text-accent-400"><Icon name="qr" /></span>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Thanh toán</h1>
          <p className="text-sm text-slate-500">
            Mã QR và thông tin chuyển khoản hiện cho khách sau khi họ xác nhận đơn.
            {updatedAt && <> Cập nhật lần cuối {fmtDate(updatedAt)}.</>}
          </p>
        </div>
      </div>

      {loading ? <p className="text-slate-400">Đang tải…</p> : (
        <form onSubmit={save} className="card grid gap-6 p-6 md:grid-cols-[16rem_1fr]">
          {/* QR */}
          <div className="text-center">
            <div className="mx-auto flex h-56 w-56 items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-slate-300 bg-slate-50">
              {qr
                ? <img src={qr} alt="Mã QR thanh toán" className="h-full w-full object-contain" />
                : <span className="px-4 text-sm text-slate-400"><Icon name="qr" size={32} className="mx-auto mb-1" />Chưa có mã QR</span>}
            </div>
            <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={pick} className="hidden" />
            <div className="mt-3 flex justify-center gap-2">
              <button type="button" onClick={() => fileRef.current?.click()} className="btn-ghost">{qr ? 'Đổi ảnh QR' : 'Tải ảnh QR lên'}</button>
              {qr && <button type="button" onClick={() => setQr(null)} className="btn-ghost text-red-600">Xóa</button>}
            </div>
            <p className="mt-2 text-xs text-slate-400">PNG / JPG / WebP. Ảnh được thu nhỏ tự động.</p>
          </div>

          {/* Text settings */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-navy-800">Thông tin chuyển khoản
              <textarea rows="6" value={instructions} onChange={(e) => setInstructions(e.target.value)} maxLength={2000}
                placeholder={'Ngân hàng: Vietcombank\nSố tài khoản: 0123456789\nChủ tài khoản: NGUYEN VAN A\nGhi chú: chuyển đúng nội dung để được đối soát nhanh'}
                className="field" />
            </label>
            <label className="block text-sm font-medium text-navy-800">Tỷ giá (VNĐ cho 1 ¥) <span className="font-normal text-slate-400">— không bắt buộc</span>
              <input type="number" min="0" step="any" value={rate} onChange={(e) => setRate(e.target.value)} placeholder="VD: 3600" className="field" />
              <span className="mt-1 block text-xs font-normal text-slate-500">
                Nếu nhập, khách thấy số tiền VNĐ tạm tính{exampleVnd ? <> (ví dụ ¥100 ≈ <b>{exampleVnd} ₫</b>)</> : ''}. Nếu để trống, khách chỉ thấy số ¥ và được nhắc hỏi nhân viên qua chat.
              </span>
            </label>

            <p className="rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
              Nội dung chuyển khoản của mỗi đơn được tạo tự động theo dạng <b className="font-mono">HV + mã đơn</b> (ví dụ <b className="font-mono">HVA1B2C3D4</b>), khách chỉ cần sao chép.
            </p>

            {msg && <p className={`rounded-lg p-2.5 text-sm ring-1 ${msg.ok ? 'bg-emerald-50 text-emerald-800 ring-emerald-100' : 'bg-red-50 text-red-700 ring-red-100'}`}>{msg.text}</p>}
            <button disabled={busy} className="btn-primary">{busy ? 'Đang lưu…' : 'Lưu cài đặt thanh toán'}</button>
          </div>
        </form>
      )}
    </div>
  )
}
