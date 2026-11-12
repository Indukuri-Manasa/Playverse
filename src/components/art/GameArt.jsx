import { useId } from 'react'
import { ChessCardArt } from '../../games/chess/art/ChessArt'

// Hand-built neon artwork per game (inline SVG, no image assets).
// Each instance gets unique gradient/filter ids via useId.

function Glow({ id, blur = 4 }) {
  return (
    <filter id={id} x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation={blur} result="b" />
      <feMerge>
        <feMergeNode in="b" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  )
}

function Floor({ color, opacity = 0.35 }) {
  const lines = []
  for (let i = -6; i <= 6; i++) lines.push(<line key={`v${i}`} x1={200 + i * 14} y1="150" x2={200 + i * 80} y2="240" />)
  for (let j = 0; j < 5; j++) {
    const y = 150 + Math.pow(j / 4, 1.6) * 90
    lines.push(<line key={`h${j}`} x1="0" y1={y} x2="400" y2={y} />)
  }
  return <g stroke={color} strokeWidth="1" opacity={opacity}>{lines}</g>
}

function TicTacToeArt({ uid }) {
  const g = `${uid}-glow`, bg = `${uid}-bg`
  const X = ({ x, y }) => (
    <g stroke="#2ee6ff" strokeWidth="7" strokeLinecap="round" filter={`url(#${g})`}>
      <line x1={x - 14} y1={y - 14} x2={x + 14} y2={y + 14} />
      <line x1={x + 14} y1={y - 14} x2={x - 14} y2={y + 14} />
    </g>
  )
  const O = ({ x, y }) => <circle cx={x} cy={y} r="15" fill="none" stroke="#ff4fb8" strokeWidth="7" filter={`url(#${g})`} />
  return (
    <>
      <defs>
        <radialGradient id={bg} cx="50%" cy="35%" r="80%">
          <stop offset="0" stopColor="#3b1670" />
          <stop offset="1" stopColor="#0b0618" />
        </radialGradient>
        <Glow id={g} />
      </defs>
      <rect width="400" height="240" fill={`url(#${bg})`} />
      <Floor color="#b26bff" />
      <g transform="translate(200 112) rotate(-8) translate(-75 -75)">
        <g stroke="#c9a2ff" strokeWidth="5" strokeLinecap="round" filter={`url(#${g})`} opacity="0.9">
          <line x1="50" y1="0" x2="50" y2="150" /><line x1="100" y1="0" x2="100" y2="150" />
          <line x1="0" y1="50" x2="150" y2="50" /><line x1="0" y1="100" x2="150" y2="100" />
        </g>
        <X x={25} y={25} /><O x={75} y={25} /><X x={125} y={25} />
        <O x={25} y={75} /><X x={75} y={75} />
        <O x={125} y={125} /><X x={25} y={125} />
        <line x1="10" y1="140" x2="140" y2="10" stroke="#fff" strokeWidth="4" strokeLinecap="round" filter={`url(#${g})`} opacity="0.95" />
      </g>
      <circle cx="330" cy="50" r="3" fill="#ff4fb8" /><circle cx="60" cy="60" r="2" fill="#2ee6ff" /><circle cx="345" cy="160" r="2.5" fill="#c9a2ff" />
    </>
  )
}

function MemoryArt({ uid }) {
  const g = `${uid}-glow`, bg = `${uid}-bg`, back = `${uid}-back`
  const Card = ({ x, y, r, face }) => (
    <g transform={`translate(${x} ${y}) rotate(${r})`}>
      <rect x="-34" y="-46" width="68" height="92" rx="10" fill={face ? '#0f2240' : `url(#${back})`} stroke={face ? '#2ee6ff' : '#7fe9ff'} strokeWidth="2.5" filter={`url(#${g})`} />
      {face ? (
        <text x="0" y="12" textAnchor="middle" fontSize="36">{face}</text>
      ) : (
        <text x="0" y="12" textAnchor="middle" fontSize="30" fontWeight="800" fill="#ffffff" opacity="0.9" fontFamily="sans-serif">?</text>
      )}
    </g>
  )
  return (
    <>
      <defs>
        <radialGradient id={bg} cx="50%" cy="30%" r="85%">
          <stop offset="0" stopColor="#063a5c" />
          <stop offset="1" stopColor="#030b1a" />
        </radialGradient>
        <linearGradient id={back} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2ee6ff" />
          <stop offset="1" stopColor="#4d7cff" />
        </linearGradient>
        <Glow id={g} blur={3.5} />
      </defs>
      <rect width="400" height="240" fill={`url(#${bg})`} />
      <Floor color="#2ee6ff" opacity={0.28} />
      <Card x={120} y={128} r={-16} />
      <Card x={280} y={128} r={16} />
      <Card x={165} y={112} r={-6} face="🚀" />
      <Card x={235} y={112} r={6} face="🚀" />
      <g fill="#ffffff" filter={`url(#${g})`}>
        <path d="M200 30c1.2 6 3.6 8.4 9.6 9.6-6 1.2-8.4 3.6-9.6 9.6-1.2-6-3.6-8.4-9.6-9.6 6-1.2 8.4-3.6 9.6-9.6z" />
        <path d="M320 60c.7 3.5 2.1 4.9 5.6 5.6-3.5.7-4.9 2.1-5.6 5.6-.7-3.5-2.1-4.9-5.6-5.6 3.5-.7 4.9-2.1 5.6-5.6z" opacity="0.7" />
        <path d="M78 54c.7 3.5 2.1 4.9 5.6 5.6-3.5.7-4.9 2.1-5.6 5.6-.7-3.5-2.1-4.9-5.6-5.6 3.5-.7 4.9-2.1 5.6-5.6z" opacity="0.7" />
      </g>
    </>
  )
}

function SnakeArt({ uid }) {
  const g = `${uid}-glow`, bg = `${uid}-bg`, body = `${uid}-body`
  const dots = []
  for (let x = 20; x < 400; x += 24) for (let y = 16; y < 240; y += 24) dots.push(<circle key={`${x}-${y}`} cx={x} cy={y} r="1.3" />)
  return (
    <>
      <defs>
        <radialGradient id={bg} cx="50%" cy="40%" r="85%">
          <stop offset="0" stopColor="#0c3a26" />
          <stop offset="1" stopColor="#030d0a" />
        </radialGradient>
        <linearGradient id={body} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#1fae6a" />
          <stop offset="0.6" stopColor="#5dff9d" />
          <stop offset="1" stopColor="#c6ff3d" />
        </linearGradient>
        <Glow id={g} blur={5} />
      </defs>
      <rect width="400" height="240" fill={`url(#${bg})`} />
      <g fill="#5dff9d" opacity="0.22">{dots}</g>
      <path
        d="M44 188 H116 V92 H188 V164 H260 V68 H316"
        fill="none" stroke={`url(#${body})`} strokeWidth="20" strokeLinecap="round" strokeLinejoin="round" filter={`url(#${g})`}
      />
      <g transform="translate(316 68)">
        <rect x="-4" y="-14" width="28" height="28" rx="9" fill="#c6ff3d" filter={`url(#${g})`} />
        <circle cx="12" cy="-5" r="3" fill="#06120c" /><circle cx="12" cy="5" r="3" fill="#06120c" />
      </g>
      <circle cx="356" cy="68" r="10" fill="#ff4fb8" filter={`url(#${g})`} />
      <circle cx="356" cy="68" r="18" fill="none" stroke="#ff4fb8" strokeWidth="1.5" opacity="0.5" />
    </>
  )
}

const ARTS = { 'tic-tac-toe': TicTacToeArt, memory: MemoryArt, snake: SnakeArt, chess: ChessCardArt }

export default function GameArt({ id, className = '' }) {
  const uid = useId().replace(/:/g, '')
  const Art = ARTS[id]
  return (
    <svg viewBox="0 0 400 240" preserveAspectRatio="xMidYMid slice" className={`game-art ${className}`.trim()} role="img" aria-hidden="true">
      {Art ? <Art uid={`a${uid}`} /> : <rect width="400" height="240" fill="#111" />}
    </svg>
  )
}
