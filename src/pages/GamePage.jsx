import { useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import GameArt from '../components/art/GameArt'
import { DifficultyMeter } from '../components/games/GameCard'
import Button from '../components/ui/Button'
import Icon from '../components/ui/Icon'
import { getGame, accentVars } from '../data/games'
import { getCategory } from '../data/categories'
import { useActivity } from '../hooks/useActivity'
import { useScores } from '../hooks/useScores'
import { useRandomGame } from '../hooks/useRandomGame'
import { personalBest } from '../utils/stats'
import { challengeStatus, dailyChallenge } from '../utils/daily'
import NotFound from './NotFound'

export default function GamePage() {
  const { gameId } = useParams()
  const game = getGame(gameId)
  const { scores } = useScores()
  const { activity, recordSession } = useActivity()
  const playRandom = useRandomGame()

  // Count one session per visit (ref guards against StrictMode's double effect run).
  const counted = useRef(null)
  useEffect(() => {
    if (!game || counted.current === game.id) return
    counted.current = game.id
    recordSession(game.id)
  }, [game, recordSession])

  if (!game) return <NotFound />

  const Game = game.component
  const best = personalBest(game, scores, activity)
  const challenge = dailyChallenge()
  const challengeHere = challenge.gameId === game.id ? challengeStatus(challenge, activity.daily) : null

  return (
    <div className="container page game-page" style={accentVars(game)}>
      <div className="game-topbar">
        <Button to="/" variant="ghost" size="sm"><Icon name="arrowLeft" size={16} /> All games</Button>
        <Button variant="ghost" size="sm" onClick={() => playRandom(game.id)}><Icon name="shuffle" size={16} /> Random game</Button>
      </div>

      <header className="game-banner">
        <div className="game-banner-art"><GameArt id={game.id} /></div>
        <div className="game-banner-body">
          <div className="chips">
            {game.categories.map((c) => (
              <span key={c} className="chip chip-glass"><Icon name={getCategory(c).icon} size={13} /> {getCategory(c).short}</span>
            ))}
            <DifficultyMeter difficulty={game.difficulty} />
          </div>
          <h1>{game.title}</h1>
          <p>{game.tagline}</p>
        </div>
        <div className="game-banner-stats">
          <div className="mini-stat"><small>{best.label}</small><strong>{best.value ?? '—'}</strong></div>
          <div className="mini-stat"><small>Sessions</small><strong>{activity.sessions[game.id] ?? 0}</strong></div>
        </div>
      </header>

      <div className="game-layout">
        <div className="game-stage">
          <div className="game-surface">
            <Game key={game.id} />
          </div>
        </div>

        <aside className="game-side">
          {challengeHere && (
            <div className={`panel side-challenge ${challengeHere.done ? 'is-done' : ''}`}>
              <span className="eyebrow"><Icon name="target" size={14} /> Today’s challenge</span>
              <strong>{challenge.title}</strong>
              <div className="bar"><i style={{ width: `${challengeHere.progress * 100}%` }} /></div>
              <small className="muted">{challengeHere.done ? 'Completed!' : challengeHere.label}</small>
            </div>
          )}
          <div className="panel how-to">
            <span className="eyebrow"><Icon name="gamepad" size={14} /> How to play</span>
            <ol>
              {game.howTo.map((step) => <li key={step}>{step}</li>)}
            </ol>
            <div className="game-meta">
              <span><Icon name="clock" size={14} /> {game.duration}</span>
              <span><Icon name="users" size={14} /> {game.players}</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
