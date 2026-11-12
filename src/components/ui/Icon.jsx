// Small inline stroke-icon set (24×24, currentColor) — no icon library needed.
const PATHS = {
  home: <><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V21h14V9.5" /><path d="M9.5 21v-6h5v6" /></>,
  compass: <><circle cx="12" cy="12" r="9" /><path d="m15.5 8.5-2 5-5 2 2-5z" /></>,
  grid: <><rect x="3.5" y="3.5" width="7" height="7" rx="1.5" /><rect x="13.5" y="3.5" width="7" height="7" rx="1.5" /><rect x="3.5" y="13.5" width="7" height="7" rx="1.5" /><rect x="13.5" y="13.5" width="7" height="7" rx="1.5" /></>,
  trophy: <><path d="M8 4h8v5a4 4 0 0 1-8 0z" /><path d="M8 6H4.5v1.5A3.5 3.5 0 0 0 8 11" /><path d="M16 6h3.5v1.5A3.5 3.5 0 0 1 16 11" /><path d="M12 13v4" /><path d="M8.5 20.5h7l-.8-3.5H9.3z" /></>,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4.5 20.5a7.5 7.5 0 0 1 15 0" /></>,
  search: <><circle cx="11" cy="11" r="6.5" /><path d="m20 20-4.2-4.2" /></>,
  play: <path d="M7 4.5v15l12.5-7.5z" fill="currentColor" stroke="none" />,
  shuffle: <><path d="M3 7h3.5c4.5 0 6.5 10 11 10H21" /><path d="M3 17h3.5c1.8 0 3.1-1.6 4.2-3.5" /><path d="M13.3 10.5C14.4 8.6 15.7 7 17.5 7H21" /><path d="m18.5 4.5 2.5 2.5-2.5 2.5" /><path d="m18.5 14.5 2.5 2.5-2.5 2.5" /></>,
  flame: <path d="M12 21c-4 0-6.5-2.6-6.5-6.2 0-3.6 2.7-5.6 3.6-8.8.9 1.6 1.6 2.6 2.9 3.2.3-2.7 1.5-4.7 3.5-6.2-.2 3.3 4.5 6.1 4.5 11.4C20 18.6 16.4 21 12 21z" />,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.5 2" /></>,
  star: <path d="m12 3.5 2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 17l-5.2 2.7 1-5.9-4.3-4.1 5.9-.8z" />,
  bolt: <path d="M13.5 2.5 5 13.5h6l-1 8 8.5-11h-6z" />,
  brain: <><path d="M9 4.5a3 3 0 0 0-3 3 3 3 0 0 0-2 5.2A3.2 3.2 0 0 0 7 18a2.7 2.7 0 0 0 5 1V6a2.4 2.4 0 0 0-3-1.5z" /><path d="M15 4.5a3 3 0 0 1 3 3 3 3 0 0 1 2 5.2A3.2 3.2 0 0 1 17 18a2.7 2.7 0 0 1-5 1" /><path d="M12 6a2.4 2.4 0 0 1 3-1.5" /></>,
  chess: <><path d="M9 20.5h6" /><path d="M7.5 20.5h9" /><path d="M9 17.5h6l-1-6h-4z" /><path d="M8 11.5h8" /><circle cx="12" cy="6.5" r="2.5" /></>,
  timer: <><circle cx="12" cy="13.5" r="7.5" /><path d="M12 13.5V9.5" /><path d="M9.5 2.5h5" /><path d="m18.5 6.5 1.5-1.5" /></>,
  target: <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.2" fill="currentColor" /></>,
  calendar: <><rect x="3.5" y="5" width="17" height="15.5" rx="2.5" /><path d="M3.5 10h17" /><path d="M8 3v4" /><path d="M16 3v4" /></>,
  crown: <><path d="m3.5 8 4 4L12 5l4.5 7 4-4-1.8 10.5H5.3z" /><path d="M5.5 21h13" /></>,
  lock: <><rect x="5" y="10.5" width="14" height="10" rx="2.5" /><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" /></>,
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  arrowLeft: <><path d="M19 12H5" /><path d="m11 18-6-6 6-6" /></>,
  arrowRight: <><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></>,
  menu: <><path d="M4 7h16" /><path d="M4 12h16" /><path d="M4 17h16" /></>,
  close: <><path d="m6 6 12 12" /><path d="M18 6 6 18" /></>,
  gamepad: <><path d="M7 7h10a4.5 4.5 0 0 1 4.4 5.5l-1 4.6a2.6 2.6 0 0 1-4.6 1L14.5 16h-5l-1.3 2.1a2.6 2.6 0 0 1-4.6-1l-1-4.6A4.5 4.5 0 0 1 7 7z" /><path d="M8 10v4" /><path d="M6 12h4" /><circle cx="15.5" cy="11" r=".6" fill="currentColor" /><circle cx="17.5" cy="13" r=".6" fill="currentColor" /></>,
  chart: <><path d="M4 20.5h16" /><path d="M7 17v-5" /><path d="M12 17V7" /><path d="M17 17v-8" /></>,
  sparkle: <path d="M12 3c.6 4.4 2.6 6.4 7 7-4.4.6-6.4 2.6-7 7-.6-4.4-2.6-6.4-7-7 4.4-.6 6.4-2.6 7-7z" />,
  users: <><circle cx="9" cy="8.5" r="3.5" /><path d="M2.5 20a6.5 6.5 0 0 1 13 0" /><path d="M15.5 5.2a3.5 3.5 0 0 1 0 6.6" /><path d="M18 14a6.5 6.5 0 0 1 3.5 6" /></>,
  edit: <><path d="M4 20h4L19.5 8.5a2.8 2.8 0 0 0-4-4L4 16z" /><path d="m13.5 6.5 4 4" /></>,
  globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18" /><path d="M12 3a14 14 0 0 1 0 18" /><path d="M12 3a14 14 0 0 0 0 18" /></>,
  cpu: <><rect x="6" y="6" width="12" height="12" rx="2" /><rect x="9.5" y="9.5" width="5" height="5" rx="1" /><path d="M9 2.5V6M15 2.5V6M9 18v3.5M15 18v3.5M2.5 9H6M2.5 15H6M18 9h3.5M18 15h3.5" /></>,
  book: <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z" /><path d="M4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5" /></>,
  scroll: <><path d="M7 3h11a2 2 0 0 1 2 2v12" /><path d="M7 3a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-2H9v2a2 2 0 0 1-2 2" /><path d="M9 8h7M9 12h7" /></>,
  history: <><path d="M3.5 12a8.5 8.5 0 1 0 2.6-6.1L3.5 8.5" /><path d="M3.5 4v4.5H8" /><path d="M12 7.5V12l3 2" /></>,
  refresh: <><path d="M20 11a8 8 0 0 0-14.6-4.5L4 8" /><path d="M4 4v4h4" /><path d="M4 13a8 8 0 0 0 14.6 4.5L20 16" /><path d="M20 20v-4h-4" /></>,
}

export default function Icon({ name, size = 20, className = '', strokeWidth = 1.8, ...rest }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`icon ${className}`.trim()}
      aria-hidden="true"
      {...rest}
    >
      {PATHS[name]}
    </svg>
  )
}
