import { PIECE_SET } from '../art/pieces'
import { COLOR_NAME, PIECE_NAME } from '../services/chessService'

// Gradients referenced by every piece. Rendered once by <PieceDefs/> inside the board.
const INK = { w: '#15122e', b: '#e2d4ff' }

export function PieceDefs() {
  return (
    <svg className="piece-defs" width="0" height="0" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="pv-piece-w" x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#cdd4ff" />
        </linearGradient>
        <linearGradient id="pv-piece-b" x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0" stopColor="#4a3897" />
          <stop offset="1" stopColor="#120a33" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export default function ChessPiece({ type, color, className = '' }) {
  const ink = INK[color]
  return (
    <svg viewBox="0 0 45 45" className={`piece piece-${color} ${className}`.trim()} role="img" aria-label={`${COLOR_NAME[color]} ${PIECE_NAME[type]}`}>
      {PIECE_SET[type].map((part, i) => (
        <path
          key={i}
          d={part.d}
          fill={part.f === 'body' ? `url(#pv-piece-${color})` : part.f === 'ink' ? ink : 'none'}
          stroke={ink}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </svg>
  )
}
