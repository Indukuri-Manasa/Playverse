import GameArt from '../art/GameArt'
import Button from '../ui/Button'
import Icon from '../ui/Icon'
import { DifficultyMeter } from '../games/GameCard'
import { gameOfTheDay } from '../../utils/daily'
import { personalBest } from '../../utils/stats'
import { accentVars } from '../../data/games'

export default function GameOfTheDay({ scores, activity }) {
  const game = gameOfTheDay()
  const best = personalBest(game, scores, activity)
  return (
    <article className="panel spotlight" style={accentVars(game)}>
      <div className="spotlight-art"><GameArt id={game.id} /></div>
      <div className="spotlight-body">
        <span className="eyebrow"><Icon name="star" size={14} /> Game of the Day</span>
        <h3>{game.title}</h3>
        <p>{game.tagline}</p>
        <div className="spotlight-meta">
          <DifficultyMeter difficulty={game.difficulty} />
          <span className="chip">{best.label}: <strong>{best.value ?? '—'}</strong></span>
        </div>
        <Button to={`/play/${game.id}`}>
          <Icon name="play" size={14} /> Play {game.title}
        </Button>
      </div>
    </article>
  )
}
