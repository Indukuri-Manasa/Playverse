import { useRef } from 'react'
import { Link } from 'react-router-dom'
import GameArt from '../art/GameArt'
import Icon from '../ui/Icon'
import Button from '../ui/Button'
import { getCategory } from '../../data/categories'
import { accentVars } from '../../data/games'

const DIFF_LEVEL = { Easy: 1, Medium: 2, Hard: 3 }

export function DifficultyMeter({ difficulty }) {
  const level = DIFF_LEVEL[difficulty] ?? 1
  return (
    <span className={`difficulty diff-${difficulty.toLowerCase()}`} title={`Difficulty: ${difficulty}`}>
      <span className="diff-bars" aria-hidden="true">
        {[1, 2, 3].map((n) => <i key={n} className={n <= level ? 'on' : ''} />)}
      </span>
      {difficulty}
    </span>
  )
}

// Neon card with a subtle pointer-driven 3D tilt (mouse only; skipped for touch and reduced motion).
export default function GameCard({ game, best, rank }) {
  const ref = useRef(null)

  function onMove(e) {
    if (e.pointerType !== 'mouse' || !ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width - 0.5
    const py = (e.clientY - rect.top) / rect.height - 0.5
    ref.current.style.setProperty('--ry', `${px * 8}deg`)
    ref.current.style.setProperty('--rx', `${-py * 8}deg`)
    ref.current.style.setProperty('--gx', `${(px + 0.5) * 100}%`)
    ref.current.style.setProperty('--gy', `${(py + 0.5) * 100}%`)
  }
  function onLeave() {
    ref.current?.style.setProperty('--rx', '0deg')
    ref.current?.style.setProperty('--ry', '0deg')
  }

  const primary = getCategory(game.categories[0])

  return (
    <article
      ref={ref}
      className="game-card"
      style={accentVars(game)}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
    >
      <Link to={`/play/${game.id}`} className="game-card-art" tabIndex={-1} aria-hidden="true">
        <GameArt id={game.id} />
        <span className="chip chip-glass">
          <Icon name={primary.icon} size={13} /> {primary.short}
        </span>
        {rank && <span className="rank-badge">#{rank}</span>}
      </Link>

      <div className="game-card-body">
        <div className="game-card-title">
          <h3>
            <Link to={`/play/${game.id}`}>{game.title}</Link>
          </h3>
          <DifficultyMeter difficulty={game.difficulty} />
        </div>
        <p>{game.tagline}</p>
        <div className="game-meta">
          <span><Icon name="clock" size={14} /> {game.duration}</span>
          <span><Icon name="users" size={14} /> {game.players}</span>
        </div>
      </div>

      <div className="game-card-footer">
        <div className="best">
          <small>{best.label}</small>
          <strong>{best.value ?? '—'}</strong>
        </div>
        <Button to={`/play/${game.id}`} size="sm" className="play-btn">
          <Icon name="play" size={14} /> Play Now
        </Button>
      </div>
    </article>
  )
}
