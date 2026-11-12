import Icon from '../ui/Icon'

export function StatTile({ icon, label, value, color }) {
  return (
    <div className="stat-tile" style={{ '--accent': color }}>
      <span className="stat-icon"><Icon name={icon} size={18} /></span>
      <span className="stat-value">{value}</span>
      <span className="stat-label">{label}</span>
    </div>
  )
}

export default function StatsPanel({ stats, wide = false }) {
  const { scores, activity, sessions, streak, unlocked, achievements } = stats
  return (
    <div className={`stat-grid ${wide ? 'stat-grid-wide' : ''}`}>
      <StatTile icon="gamepad" label="Games played" value={sessions} color="#2ee6ff" />
      <StatTile icon="flame" label="Day streak" value={streak} color="#ff7a45" />
      <StatTile icon="trophy" label="Achievements" value={`${unlocked}/${achievements.length}`} color="#ffc94d" />
      <StatTile icon="chess" label="CPU wins" value={activity.ttt.win} color="#b26bff" />
      <StatTile icon="bolt" label="Snake best" value={scores.snake ?? '—'} color="#5dff9d" />
      <StatTile icon="brain" label="Memory best" value={scores.memory ?? '—'} color="#4d7cff" />
    </div>
  )
}
