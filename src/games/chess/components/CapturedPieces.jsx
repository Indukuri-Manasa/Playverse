import ChessPiece from './ChessPiece'

// Pieces captured BY `color` (i.e. the opponent's lost pieces) + material lead.
export default function CapturedPieces({ material, color, label }) {
  const taken = material.capturedBy[color]
  const lead = material.advantage[color]
  const opp = color === 'w' ? 'b' : 'w'
  return (
    <div className="captured">
      {label && <span className="captured-label">{label}</span>}
      <span className="captured-pieces">
        {taken.length === 0 && <span className="captured-none">—</span>}
        {taken.map((t, i) => <ChessPiece key={i} type={t} color={opp} className="mini" />)}
      </span>
      {lead > 0 && <span className="captured-lead">+{lead}</span>}
    </div>
  )
}
