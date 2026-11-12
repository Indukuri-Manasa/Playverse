import { useEffect, useState } from 'react'
import Button from '../components/ui/Button'
import { useScores } from '../hooks/useScores'
import { shuffle } from '../utils/shuffle'

const SYMBOLS = ['🍎', '🚀', '🎈', '🌵', '🐙', '🎲', '⚡', '🍩']

const newDeck = () =>
  shuffle([...SYMBOLS, ...SYMBOLS]).map((symbol, id) => ({ id, symbol, matched: false }))

export default function MemoryMatch() {
  const { scores, reportScore } = useScores()
  const [cards, setCards] = useState(newDeck)
  const [flipped, setFlipped] = useState([])
  const [moves, setMoves] = useState(0)

  const done = cards.every((c) => c.matched)
  const best = scores.memory

  // Resolve a pair once two cards are face up.
  useEffect(() => {
    if (flipped.length !== 2) return
    const [a, b] = flipped
    if (cards[a].symbol === cards[b].symbol) {
      setCards((cs) => cs.map((c, i) => (i === a || i === b ? { ...c, matched: true } : c)))
      setFlipped([])
      return
    }
    const id = setTimeout(() => setFlipped([]), 800)
    return () => clearTimeout(id)
  }, [flipped, cards])

  useEffect(() => {
    if (done) reportScore('memory', moves, { lowerIsBetter: true })
  }, [done, moves, reportScore])

  function flip(i) {
    if (flipped.length === 2 || cards[i].matched || flipped.includes(i)) return
    const next = [...flipped, i]
    setFlipped(next)
    if (next.length === 2) setMoves((m) => m + 1)
  }

  function restart() {
    setCards(newDeck())
    setFlipped([])
    setMoves(0)
  }

  return (
    <div className="memory">
      <div className="scoreline">
        <span>Moves: <strong>{moves}</strong></span>
        <span>Pairs: <strong>{cards.filter((c) => c.matched).length / 2}/{SYMBOLS.length}</strong></span>
        <span>Best: <strong>{best ?? '—'}</strong></span>
      </div>

      <p className={`status ${done ? 'status-win' : ''}`} aria-live="polite">
        {done ? `Cleared in ${moves} moves${best === moves ? ' — new best!' : ''}` : 'Find all the pairs.'}
      </p>

      <div className="memory-grid">
        {cards.map((card, i) => {
          const faceUp = card.matched || flipped.includes(i)
          return (
            <button
              key={card.id}
              className={`memory-card ${faceUp ? 'face-up' : ''} ${card.matched ? 'matched' : ''}`}
              onClick={() => flip(i)}
              aria-label={faceUp ? card.symbol : 'Hidden card'}
            >
              <span className="memory-inner">
                <span className="memory-front" aria-hidden="true">?</span>
                <span className="memory-back" aria-hidden="true">{card.symbol}</span>
              </span>
            </button>
          )
        })}
      </div>

      <div className="actions">
        <Button onClick={restart}>{done ? 'Play again' : 'Restart'}</Button>
      </div>
    </div>
  )
}
