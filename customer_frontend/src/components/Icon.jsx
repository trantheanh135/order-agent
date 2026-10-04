// Small stroke-icon set (24x24 grid) so we need no icon dependency.
const PATHS = {
  package: <><path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z" /><path d="M4 7.5l8 4.5 8-4.5M12 12v9" /></>,
  cart: <><path d="M3 4h2.5l2 11h10.5l2-8H7" /><circle cx="9.5" cy="19" r="1.5" /><circle cx="16.5" cy="19" r="1.5" /></>,
  truck: <><path d="M2.5 6.5h11v9h-11zM13.5 9.5h4l3 3.2v2.8h-7" /><circle cx="7" cy="17.5" r="1.8" /><circle cx="17" cy="17.5" r="1.8" /></>,
  ship: <><path d="M3 15l2 5h14l2-5-9-2.5L3 15z" /><path d="M6.5 13.2V9h11v4.2M10 9V5.5h4V9" /></>,
  plane: <path d="M21 3L3 10.5l6.5 2.5L12 20l2.5-5.5L21 3zM9.5 13L21 3" />,
  warehouse: <><path d="M3 10l9-6 9 6v10H3V10z" /><path d="M8 20v-6h8v6M8 17h8" /></>,
  check: <path d="M5 12.5l4.5 4.5L19 7" />,
  ban: <><circle cx="12" cy="12" r="8.5" /><path d="M6 6l12 12" /></>,
  search: <><circle cx="11" cy="11" r="6.5" /><path d="M20 20l-4.2-4.2" /></>,
  refresh: <path d="M20 11a8 8 0 10-2.3 6M20 4.5V11h-6.5" />,
  logout: <path d="M10 4H5v16h5M15 8l4 4-4 4M19 12H9" />,
  users: <><circle cx="9" cy="8" r="3" /><path d="M3 20c0-3.2 2.8-5.2 6-5.2s6 2 6 5.2" /><circle cx="17" cy="9" r="2.3" /><path d="M17 14.3c2.4 0 4 1.6 4 4" /></>,
  external: <path d="M14 4h6v6M20 4l-9 9M18 14v6H4V6h6" />,
  x: <path d="M6 6l12 12M18 6L6 18" />,
  copy: <><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M16 8V6a2 2 0 00-2-2H6a2 2 0 00-2 2v8a2 2 0 002 2h2" /></>,
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
  pin: <><path d="M12 21s7-6.2 7-11.5A7 7 0 005 9.5C5 14.8 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.4" /></>,
  chat: <path d="M4 5h16v11H9.5L4 20.5V5z" />,
  send: <path d="M3 11.5l18-8-8 18-2.2-7.8L3 11.5zM10.8 13.7L21 3.5" />,
  play: <><circle cx="12" cy="12" r="9" /><path d="M10 8.5l5.5 3.5-5.5 3.5z" /></>,
  qr: <><rect x="4" y="4" width="6" height="6" rx="1" /><rect x="14" y="4" width="6" height="6" rx="1" /><rect x="4" y="14" width="6" height="6" rx="1" /><path d="M14 14h3v3h-3zM20 14v3M17 20h3M14 20v-3" /></>,
  wallet: <><path d="M3 7a2 2 0 012-2h13v3" /><path d="M3 7v11a2 2 0 002 2h14a1 1 0 001-1V9a1 1 0 00-1-1H5a2 2 0 01-2-2z" /><circle cx="16.5" cy="14" r="1.2" /></>,
  inbox: <path d="M3 13l3-8h12l3 8v6H3v-6zM3 13h5l1 2.5h6l1-2.5h5" />,
}

export default function Icon({ name, size = 20, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {PATHS[name]}
    </svg>
  )
}
