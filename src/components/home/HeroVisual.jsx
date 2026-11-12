import { useId } from 'react'

// Abstract neon arcade scene: floating controller, orbit ring, game glyphs and a grid floor.
export default function HeroVisual() {
  const id = useId().replace(/:/g, '')
  const u = (n) => `${n}${id}`
  return (
    <div className="hero-visual" aria-hidden="true">
      <svg viewBox="0 0 520 460" className="hero-svg">
        <defs>
          <linearGradient id={u('body')} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#2a1f63" />
            <stop offset="1" stopColor="#0d0a2a" />
          </linearGradient>
          <linearGradient id={u('rim')} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#2ee6ff" />
            <stop offset="0.5" stopColor="#8b5cff" />
            <stop offset="1" stopColor="#ff4fb8" />
          </linearGradient>
          <radialGradient id={u('halo')} cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor="#8b5cff" stopOpacity="0.55" />
            <stop offset="1" stopColor="#8b5cff" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={u('cubeT')} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#7af3ff" /><stop offset="1" stopColor="#2ee6ff" /></linearGradient>
          <linearGradient id={u('cubeL')} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1aa6c4" /><stop offset="1" stopColor="#0b4e6a" /></linearGradient>
          <linearGradient id={u('cubeR')} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#7b4dff" /><stop offset="1" stopColor="#3a1f99" /></linearGradient>
          <filter id={u('glow')} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Floor grid */}
        <g className="hero-floor" stroke={`url(#${u('rim')})`} strokeWidth="1.2" opacity="0.45">
          {Array.from({ length: 13 }, (_, i) => (
            <line key={`v${i}`} x1={260 + (i - 6) * 22} y1="330" x2={260 + (i - 6) * 110} y2="460" />
          ))}
          {[0, 1, 2, 3, 4, 5].map((j) => {
            const y = 330 + Math.pow(j / 5, 1.7) * 130
            return <line key={`h${j}`} x1="0" y1={y} x2="520" y2={y} />
          })}
        </g>

        <circle cx="260" cy="215" r="190" fill={`url(#${u('halo')})`} />

        {/* Orbit ring (back half) */}
        <g className="hero-orbit">
          <ellipse cx="260" cy="225" rx="215" ry="62" fill="none" stroke={`url(#${u('rim')})`} strokeWidth="2.5" opacity="0.7" />
          <circle cx="45" cy="225" r="7" fill="#2ee6ff" filter={`url(#${u('glow')})`} />
          <circle cx="475" cy="225" r="5" fill="#ff4fb8" filter={`url(#${u('glow')})`} />
        </g>

        {/* Controller */}
        <g className="hero-float hero-pad">
          <path
            d="M150 170c0-32 26-50 64-50h92c38 0 64 18 64 50l26 108c9 37-18 60-46 48l-46-38H200l-46 38c-28 12-55-11-46-48z"
            fill={`url(#${u('body')})`} stroke={`url(#${u('rim')})`} strokeWidth="4" filter={`url(#${u('glow')})`}
          />
          <path d="M214 132h92c28 0 48 10 54 30" fill="none" stroke="#fff" strokeOpacity="0.25" strokeWidth="3" strokeLinecap="round" />
          {/* D-pad */}
          <g fill="#2ee6ff" filter={`url(#${u('glow')})`}>
            <rect x="185" y="186" width="16" height="50" rx="4" />
            <rect x="168" y="203" width="50" height="16" rx="4" />
          </g>
          {/* Face buttons */}
          <g filter={`url(#${u('glow')})`}>
            <circle cx="338" cy="190" r="10" fill="#ff4fb8" />
            <circle cx="360" cy="212" r="10" fill="#5dff9d" />
            <circle cx="316" cy="212" r="10" fill="#ffc94d" />
            <circle cx="338" cy="234" r="10" fill="#8b5cff" />
          </g>
          <rect x="242" y="176" width="16" height="6" rx="3" fill="#fff" opacity="0.6" />
          <rect x="266" y="176" width="16" height="6" rx="3" fill="#fff" opacity="0.6" />
          <circle cx="226" cy="262" r="18" fill="#100c33" stroke="#8b5cff" strokeWidth="3" />
          <circle cx="296" cy="262" r="18" fill="#100c33" stroke="#8b5cff" strokeWidth="3" />
        </g>

        {/* Orbit ring (front arc over controller) */}
        <path className="hero-orbit" d="M45 225a215 62 0 0 0 430 0" fill="none" stroke={`url(#${u('rim')})`} strokeWidth="3" filter={`url(#${u('glow')})`} />

        {/* Floating glyphs */}
        <g className="hero-float f2"><g transform="translate(82 92)">
          <polygon points="0,-26 26,-12 0,2 -26,-12" fill={`url(#${u('cubeT')})`} />
          <polygon points="-26,-12 0,2 0,32 -26,18" fill={`url(#${u('cubeL')})`} />
          <polygon points="26,-12 0,2 0,32 26,18" fill={`url(#${u('cubeR')})`} />
        </g></g>
        <g className="hero-float f3"><g transform="translate(440 92)" stroke="#ff4fb8" strokeWidth="7" strokeLinecap="round" filter={`url(#${u('glow')})`}>
          <line x1="-14" y1="-14" x2="14" y2="14" /><line x1="14" y1="-14" x2="-14" y2="14" />
        </g></g>
        <g className="hero-float f4"><g transform="translate(468 318)">
          <circle r="17" fill="none" stroke="#2ee6ff" strokeWidth="7" filter={`url(#${u('glow')})`} />
        </g></g>
        <g className="hero-float f5"><g transform="translate(58 320) rotate(-12)">
          <rect x="-20" y="-27" width="40" height="54" rx="7" fill="#8b5cff" stroke="#c9a2ff" strokeWidth="2" filter={`url(#${u('glow')})`} />
          <text y="9" textAnchor="middle" fontSize="24" fontWeight="800" fill="#fff" fontFamily="sans-serif">?</text>
        </g></g>
        <g className="hero-float f6"><g transform="translate(372 52)">
          <rect x="-9" y="-9" width="18" height="18" rx="4" fill="#5dff9d" filter={`url(#${u('glow')})`} />
          <rect x="13" y="-9" width="18" height="18" rx="4" fill="#5dff9d" opacity="0.7" />
          <rect x="35" y="-9" width="18" height="18" rx="4" fill="#5dff9d" opacity="0.45" />
        </g></g>
        <g className="hero-float f3"><g transform="translate(150 40)" fill="#ffc94d" filter={`url(#${u('glow')})`}>
          <path d="M0-14c1 7 4 10 11 11-7 1-10 4-11 11-1-7-4-10-11-11 7-1 10-4 11-11z" />
        </g></g>
      </svg>
    </div>
  )
}
