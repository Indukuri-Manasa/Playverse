import Icon from '../ui/Icon'

export default function AchievementGrid({ achievements }) {
  return (
    <div className="achievement-grid">
      {achievements.map((a) => (
        <div key={a.id} className={`achievement ${a.unlocked ? 'unlocked' : 'locked'}`} style={{ '--accent': a.color }}>
          <span className="achievement-icon">
            <Icon name={a.unlocked ? a.icon : 'lock'} size={22} />
          </span>
          <div className="achievement-text">
            <strong>{a.title}</strong>
            <small>{a.description}</small>
            <span className="bar" aria-label={`${a.current} of ${a.goal}`}>
              <i style={{ width: `${a.progress * 100}%` }} />
            </span>
          </div>
          <span className="achievement-count">{a.unlocked ? <Icon name="check" size={16} strokeWidth={2.6} /> : `${a.current}/${a.goal}`}</span>
        </div>
      ))}
    </div>
  )
}
