import { useEffect } from 'react'
import Button from '../../../components/ui/Button'
import Icon from '../../../components/ui/Icon'
import ChessPiece from './ChessPiece'
import { REASON_LABEL } from '../services/chessStatsService'

/**
 * Match-completion overlay.
 * outcome = { winner: 'w'|'b'|null, reason }, names = { w, b }
 */
export default function GameResult({ outcome, names, moves, perspective, onRematch, onReview, onExit, rematchLabel = 'Rematch' }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onReview()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onReview])

  const draw = !outcome.winner
  // perspective (vs-computer / online): 'w'|'b' → "You win" / "You lost"
  const personal = perspective && !draw ? (outcome.winner === perspective ? 'win' : 'loss') : null
  const title = draw ? 'Draw' : personal === 'win' ? 'Victory!' : personal === 'loss' ? 'Defeat' : `${names[outcome.winner]} wins!`
  const tone = draw ? 'draw' : personal === 'loss' ? 'loss' : 'win'

  return (
    <div className="result-backdrop" role="dialog" aria-modal="true" aria-labelledby="result-title">
      <div className={`result-card tone-${tone}`}>
        <div className="result-emblem" aria-hidden="true">
          {draw ? (
            <span className="result-pair"><ChessPiece type="k" color="w" /><ChessPiece type="k" color="b" /></span>
          ) : (
            <ChessPiece type="k" color={outcome.winner} />
          )}
        </div>
        <span className="eyebrow">{draw ? 'Game drawn' : 'Game over'}</span>
        <h2 id="result-title">{title}</h2>
        <p className="result-reason">
          {REASON_LABEL[outcome.reason] ?? outcome.reason}
          {!draw && personal && ` · ${names[outcome.winner]} wins`}
        </p>
        <dl className="result-stats">
          <div><dt>Moves</dt><dd>{moves}</dd></div>
          <div><dt>White</dt><dd>{names.w}</dd></div>
          <div><dt>Black</dt><dd>{names.b}</dd></div>
        </dl>
        <div className="result-actions">
          <Button onClick={onRematch} size="lg"><Icon name="refresh" size={16} /> {rematchLabel}</Button>
          <Button variant="secondary" onClick={onReview}><Icon name="search" size={16} /> Review board</Button>
          <Button variant="ghost" onClick={onExit}><Icon name="arrowLeft" size={16} /> Chess Battle</Button>
        </div>
      </div>
    </div>
  )
}
