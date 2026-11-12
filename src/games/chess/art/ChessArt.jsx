import { Piece } from './Piece'

// Shared SVG helpers + illustrations for Chess Battle (library card + mode cards).

function Glow({ id, blur = 4 }) {
  return (
    <filter id={id} x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation={blur} result="b" />
      <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
    </filter>
  )
}

// Isometric 8×8 board centred at (cx, cy).
function IsoBoard({ cx, cy, size, light = '#2c2170', dark = '#150f38', edge, glow }) {
  const sq = size / 8
  const cells = []
  for (let r = 0; r < 8; r++)
    for (let c = 0; c < 8; c++)
      cells.push(<rect key={`${r}${c}`} x={c * sq} y={r * sq} width={sq} height={sq} fill={(r + c) % 2 ? dark : light} />)
  return (
    <g transform={`translate(${cx} ${cy}) scale(1 0.5) rotate(45) translate(${-size / 2} ${-size / 2})`}>
      {cells}
      <rect width={size} height={size} fill="none" stroke={edge} strokeWidth="3" filter={glow} />
    </g>
  )
}

/** Library / banner artwork (400×240), used through GameArt. */
export function ChessCardArt({ uid }) {
  const g = `${uid}-g`, bg = `${uid}-bg`, kn = `${uid}-kn`, edge = `${uid}-edge`
  return (
    <>
      <defs>
        <radialGradient id={bg} cx="50%" cy="35%" r="85%">
          <stop offset="0" stopColor="#2a1766" /><stop offset="1" stopColor="#05061a" />
        </radialGradient>
        <linearGradient id={kn} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" /><stop offset="1" stopColor="#b9c4ff" />
        </linearGradient>
        <linearGradient id={edge} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2ee6ff" /><stop offset="1" stopColor="#b26bff" />
        </linearGradient>
        <Glow id={g} />
      </defs>
      <rect width="400" height="240" fill={`url(#${bg})`} />
      <IsoBoard cx={200} cy={168} size={150} edge={`url(#${edge})`} glow={`url(#${g})`} />
      <ellipse cx="172" cy="160" rx="34" ry="9" fill="#2ee6ff" opacity="0.25" />
      <Piece type="knight" x={116} y={58} scale={2.5} fill={`url(#${kn})`} stroke="#2ee6ff" strokeWidth={2.2} filter={`url(#${g})`} />
      <Piece type="king" x={226} y={84} scale={1.75} fill="#1a1046" stroke="#ff4fb8" strokeWidth={2.2} filter={`url(#${g})`} />
      <circle cx="70" cy="50" r="2.5" fill="#2ee6ff" /><circle cx="340" cy="44" r="3" fill="#ff4fb8" /><circle cx="330" cy="170" r="2" fill="#b26bff" />
    </>
  )
}

function ModeFrame({ uid, from, to, children }) {
  return (
    <>
      <defs>
        <radialGradient id={`${uid}-bg`} cx="50%" cy="40%" r="85%">
          <stop offset="0" stopColor={from} /><stop offset="1" stopColor={to} />
        </radialGradient>
        <Glow id={`${uid}-g`} />
        <Glow id={`${uid}-g2`} blur={8} />
      </defs>
      <rect width="360" height="200" fill={`url(#${uid}-bg)`} />
      {children}
    </>
  )
}

/** Mode A — two knights face off over a shared board. */
export function FriendArt({ uid }) {
  const g = `url(#${uid}-g)`
  return (
    <ModeFrame uid={uid} from="#3a1670" to="#0a0620">
      <IsoBoard cx={180} cy={162} size={120} light="#3a2380" dark="#1a1040" edge="#b26bff" glow={g} />
      <Piece type="knight" x={70} y={44} scale={2.2} fill="#f2f0ff" stroke="#b26bff" strokeWidth={2.2} filter={g} />
      <Piece type="knight" x={192} y={44} scale={2.2} flip fill="#1a1040" stroke="#ff4fb8" strokeWidth={2.2} filter={g} />
      <text x="180" y="86" textAnchor="middle" fontFamily="'Space Grotesk Variable', sans-serif" fontWeight="800" fontSize="30"
        fill="#fff" filter={`url(#${uid}-g2)`} className="mode-vs">VS</text>
    </ModeFrame>
  )
}

/** Mode B — your king against a glowing engine core. */
export function ComputerArt({ uid }) {
  const g = `url(#${uid}-g)`
  const traces = []
  for (let i = 0; i < 6; i++) {
    const y = 40 + i * 24
    traces.push(<path key={i} d={`M360 ${y}H${300 - (i % 3) * 14}l-12 ${i % 2 ? 12 : -12}H240`} />)
  }
  return (
    <ModeFrame uid={uid} from="#06395a" to="#030a1a">
      <g stroke="#2ee6ff" strokeWidth="1.5" fill="none" opacity="0.35">{traces}</g>
      <g fill="#2ee6ff" opacity="0.6">{[40, 88, 136, 160].map((y) => <circle key={y} cx="240" cy={y} r="3" />)}</g>
      <IsoBoard cx={118} cy={168} size={100} light="#0f3b5e" dark="#071a30" edge="#2ee6ff" glow={g} />
      <Piece type="king" x={72} y={58} scale={2.1} fill="#f2f8ff" stroke="#2ee6ff" strokeWidth={2.2} filter={g} />
      <g transform="translate(250 100)" filter={g} className="mode-core">
        <rect x="-44" y="-44" width="88" height="88" rx="16" fill="#071a30" stroke="#2ee6ff" strokeWidth="3" />
        <rect x="-30" y="-30" width="60" height="60" rx="10" fill="none" stroke="#4d7cff" strokeWidth="2" />
        {[-28, -10, 8, 26].map((o) => (
          <g key={o} stroke="#2ee6ff" strokeWidth="3" strokeLinecap="round">
            <line x1={o} y1="-44" x2={o} y2="-56" /><line x1={o} y1="44" x2={o} y2="56" />
            <line x1="-44" y1={o} x2="-56" y2={o} /><line x1="44" y1={o} x2="56" y2={o} />
          </g>
        ))}
        <Piece type="knight" x={-18} y={-20} scale={0.85} fill="#2ee6ff" stroke="#bff6ff" strokeWidth={1.4} />
      </g>
    </ModeFrame>
  )
}

/** Mode C — two players linked across a neon globe. */
export function OnlineArt({ uid }) {
  const g = `url(#${uid}-g)`
  return (
    <ModeFrame uid={uid} from="#4a0f3d" to="#0d0414">
      <g transform="translate(180 104)" fill="none" stroke="#ff4fb8" strokeWidth="1.6" opacity="0.75" className="mode-globe">
        <circle r="62" filter={g} />
        <ellipse rx="62" ry="22" /><ellipse rx="62" ry="44" opacity="0.5" />
        <ellipse rx="22" ry="62" /><ellipse rx="44" ry="62" opacity="0.5" />
        <line x1="-62" y1="0" x2="62" y2="0" opacity="0.5" />
      </g>
      <path d="M62 120C90 30 270 30 298 120" fill="none" stroke="#ffc94d" strokeWidth="2.5" strokeDasharray="6 7" filter={g} className="mode-link" />
      <circle cx="180" cy="53" r="5" fill="#ffc94d" filter={g} />
      <Piece type="pawn" x={36} y={110} scale={1.25} fill="#f7f0ff" stroke="#ff4fb8" strokeWidth={2} filter={g} />
      <Piece type="pawn" x={268} y={110} scale={1.25} fill="#2a0b26" stroke="#ff9f43" strokeWidth={2} filter={g} />
    </ModeFrame>
  )
}
