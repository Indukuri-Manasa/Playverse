import { useEffect } from 'react'
import ChessPiece from './ChessPiece'
import { PIECE_NAME } from '../services/chessService'

export default function PromotionDialog({ color, onPick, onCancel }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onCancel()
      const map = { q: 'q', r: 'r', b: 'b', n: 'n' }
      if (map[e.key?.toLowerCase()]) onPick(map[e.key.toLowerCase()])
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onPick, onCancel])

  return (
    <div className="promo-backdrop" onPointerDown={(e) => { e.stopPropagation(); onCancel() }}>
      <div className="promo-dialog" role="dialog" aria-label="Choose promotion piece" onPointerDown={(e) => e.stopPropagation()}>
        <span className="promo-title">Promote pawn to</span>
        <div className="promo-options">
          {['q', 'r', 'b', 'n'].map((t) => (
            <button key={t} className="promo-option" onClick={() => onPick(t)} aria-label={PIECE_NAME[t]} title={`${PIECE_NAME[t]} (${t.toUpperCase()})`}>
              <ChessPiece type={t} color={color} />
            </button>
          ))}
        </div>
        <button className="promo-cancel" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  )
}
