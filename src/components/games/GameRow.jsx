import { Link } from 'react-router-dom'
import GameArt from '../art/GameArt'
import Icon from '../ui/Icon'

// Compact list row used by Trending, Recently Played and Categories.
import { accentVars } from '../../data/games'
export default function GameRow({ game, rank, meta, sub }) {
  return (
    <Link to={`/play/${game.id}`} className="game-row" style={accentVars(game)}>
      {rank != null && <span className="game-row-rank">{String(rank).padStart(2, '0')}</span>}
      <span className="game-row-thumb"><GameArt id={game.id} /></span>
      <span className="game-row-text">
        <strong>{game.title}</strong>
        <small>{sub}</small>
      </span>
      {meta && <span className="game-row-meta">{meta}</span>}
      <span className="game-row-play" aria-hidden="true"><Icon name="play" size={12} /></span>
    </Link>
  )
}
