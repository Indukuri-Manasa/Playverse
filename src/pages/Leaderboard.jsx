import { Link } from 'react-router-dom'
import GameArt from '../components/art/GameArt'
import PageHeader from '../components/ui/PageHeader'
import Button from '../components/ui/Button'
import Icon from '../components/ui/Icon'
import { games, getGame, accentVars } from '../data/games'
import { usePlayerStats } from '../hooks/usePlayerStats'
import { personalBest } from '../utils/stats'
import { shortDate } from '../utils/format'

function topRuns(runs = [], lowerIsBetter) {
  return [...runs].sort((a, b) => (lowerIsBetter ? a.score - b.score : b.score - a.score) || b.at - a.at).slice(0, 10)
}

export default function Leaderboard() {
  const { scores, activity } = usePlayerStats()
  const { win, loss, draw } = activity.ttt
  const played = win + loss + draw

  return (
    <div className="container page">
      <PageHeader icon="trophy" eyebrow="Leaderboard" title="Hall of Fame" subtitle="Your best runs on this device, game by game." />

      <div className="podium">
        {games.map((g, i) => {
          const best = personalBest(g, scores, activity)
          return (
            <Link key={g.id} to={`/play/${g.id}`} className={`podium-card p${i}`} style={accentVars(g)}>
              <span className="podium-art"><GameArt id={g.id} /></span>
              <span className="podium-body">
                <small>{g.title}</small>
                <strong>{best.value ?? '—'}</strong>
                <span>{best.label}</span>
              </span>
            </Link>
          )
        })}
      </div>

      <div className="board-grid">
        {games.filter((g) => g.score).map((g) => {
          const runs = topRuns(activity.history[g.id], g.score.lowerIsBetter)
          return (
            <section key={g.id} className="panel board" style={accentVars(g)}>
              <div className="board-head">
                <h2>{g.title}</h2>
                <span className="chip">{g.score.lowerIsBetter ? 'Fewest moves wins' : 'Highest score wins'}</span>
              </div>
              {runs.length ? (
                <ol className="board-list">
                  {runs.map((r, i) => (
                    <li key={`${r.at}-${i}`} className={i < 3 ? `top top-${i + 1}` : ''}>
                      <span className="board-rank">{i + 1}</span>
                      <span className="board-name">{activity.playerName}</span>
                      <span className="board-date">{shortDate(r.at)}</span>
                      <strong className="board-score">{r.score}</strong>
                    </li>
                  ))}
                </ol>
              ) : (
                <div className="empty">
                  <p>No runs recorded yet.</p>
                  <Button to={`/play/${g.id}`} size="sm"><Icon name="play" size={12} /> Set a record</Button>
                </div>
              )}
            </section>
          )
        })}

        <section className="panel board" style={accentVars(getGame('tic-tac-toe'))}>
          <div className="board-head">
            <h2>Tic-Tac-Toe vs CPU</h2>
            <span className="chip">{played} rounds</span>
          </div>
          <div className="record">
            <div className="record-nums">
              <div><strong className="c-win">{win}</strong><small>Wins</small></div>
              <div><strong className="c-draw">{draw}</strong><small>Draws</small></div>
              <div><strong className="c-loss">{loss}</strong><small>Losses</small></div>
            </div>
            <div className="record-bar" aria-hidden="true">
              {played > 0 && (
                <>
                  <i className="c-win" style={{ flex: win }} />
                  <i className="c-draw" style={{ flex: draw }} />
                  <i className="c-loss" style={{ flex: loss }} />
                </>
              )}
            </div>
            <p className="muted">
              {played ? `Win rate ${Math.round((win / played) * 100)}%` : 'Play a round against the CPU to start your record.'}
            </p>
            <Button to="/play/tic-tac-toe" size="sm" variant="secondary"><Icon name="play" size={12} /> Challenge the CPU</Button>
          </div>
        </section>
      </div>
    </div>
  )
}
