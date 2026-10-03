// Product thumbnail from the shop's CDN (http/https only). Hides itself if it can't load.
export default function Thumb({ url, size = 44 }) {
  if (!url || !/^https?:\/\//.test(url)) return null
  return (
    <img
      src={url}
      alt=""
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={(e) => { e.currentTarget.style.display = 'none' }}
      className="shrink-0 rounded-lg border border-slate-200 bg-slate-100 object-cover"
      style={{ width: size, height: size }}
    />
  )
}
