import { useId } from 'react'

export default function Logo({ size = 34 }) {
  const id = useId().replace(/:/g, '')
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true" className="logo-mark">
      <defs>
        <linearGradient id={`lg${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2ee6ff" />
          <stop offset="0.5" stopColor="#8b5cff" />
          <stop offset="1" stopColor="#ff4fb8" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="36" height="36" rx="11" fill={`url(#lg${id})`} />
      <rect x="3.5" y="3.5" width="33" height="33" rx="9.5" fill="#0a0d1f" opacity="0.55" />
      <path d="M12 15.5h16a5 5 0 0 1 4.9 6l-.9 4.2a2.6 2.6 0 0 1-4.5 1.1L25.6 25h-11.2l-1.9 1.8A2.6 2.6 0 0 1 8 25.7l-.9-4.2a5 5 0 0 1 4.9-6z" fill="#fff" />
      <path d="M13 18.5v4M11 20.5h4" stroke="#0a0d1f" strokeWidth="1.7" strokeLinecap="round" />
      <circle cx="25.5" cy="19.5" r="1.3" fill="#ff4fb8" />
      <circle cx="28.3" cy="22" r="1.3" fill="#2ee6ff" />
    </svg>
  )
}
