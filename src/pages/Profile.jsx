import { useState } from 'react'
import AchievementGrid from '../components/home/AchievementGrid'
import StatsPanel from '../components/home/StatsPanel'
import GameRow from '../components/games/GameRow'
import SectionHeader from '../components/ui/SectionHeader'
import Button from '../components/ui/Button'
import Icon from '../components/ui/Icon'
import { games } from '../data/games'
import { useActivity } from '../hooks/useActivity'
import { useScores } from '../hooks/useScores'
import { usePlayerStats } from '../hooks/usePlayerStats'
import { personalBest } from '../utils/stats'

export default function Profile() {
  const stats = usePlayerStats()
  const { activity, level, scores } = stats
  const { setPlayerName, resetActivity } = useActivity()
  const { resetScores } = useScores()
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(activity.playerName)

  function save(e) {
    e.preventDefault()
    setPlayerName(name)
    setEditing(false)
  }

  function reset() {
    if (window.confirm('Reset all scores, history and achievements on this device? This cannot be undone.')) {
      resetScores()
      resetActivity()
    }
  }

  const firstDay = [...activity.days].sort()[0]

  return (
    <div className="container page">
      <section className="panel profile-card">
        <div className="avatar-lg">{activity.playerName.charAt(0).toUpperCase()}</div>
        <div className="profile-main">
          {editing ? (
            <form onSubmit={save} className="name-form">
              <input value={name} onChange={(e) => setName(e.target.value)} maxLength={24} autoFocus aria-label="Player name" />
              <Button type="submit" size="sm">Save</Button>
              <Button type="button" size="sm" variant="ghost" onClick={() => { setName(activity.playerName); setEditing(false) }}>Cancel</Button>
            </form>
          ) : (
            <h1>
              {activity.playerName}
              <button className="icon-btn" onClick={() => { setName(activity.playerName); setEditing(true) }} aria-label="Edit name">
                <Icon name="edit" size={16} />
              </button>
            </h1>
          )}
          <p className="muted">
            Level {level.level} player{firstDay ? ` · playing since ${new Date(firstDay).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}` : ''}
          </p>
          <div className="xp">
            <div className="xp-bar"><i style={{ width: `${(level.into / level.per) * 100}%` }} /></div>
            <small>{level.into} / {level.per} XP to level {level.level + 1} · {level.xp} XP total</small>
          </div>
        </div>
        <div className="level-badge">
          <small>LVL</small>
          <strong>{level.level}</strong>
        </div>
      </section>

      <div className="split-2 profile-split">
        <section className="panel">
          <SectionHeader icon="chart" eyebrow="Overview" title="Statistics" />
          <StatsPanel stats={stats} />
        </section>
        <section className="panel">
          <SectionHeader icon="star" eyebrow="Per game" title="Personal Bests" link="/leaderboard" linkLabel="Leaderboard" />
          <div className="row-list">
            {games.map((g) => {
              const best = personalBest(g, scores, activity)
              return <GameRow key={g.id} game={g} sub={best.label} meta={best.value ?? '—'} />
            })}
          </div>
        </section>
      </div>

      <section>
        <SectionHeader icon="trophy" eyebrow={`${stats.unlocked} of ${stats.achievements.length} unlocked`} title="Achievements" />
        <AchievementGrid achievements={stats.achievements} />
      </section>

      <section className="panel danger-zone">
        <div>
          <h3>Reset progress</h3>
          <p className="muted">Clears best scores, play history and achievements stored in this browser.</p>
        </div>
        <Button variant="danger" onClick={reset}><Icon name="refresh" size={16} /> Reset everything</Button>
      </section>
    </div>
  )
}
