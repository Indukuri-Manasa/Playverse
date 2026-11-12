import { useId } from 'react'
import Button from '../../../components/ui/Button'
import Icon from '../../../components/ui/Icon'

export default function ModeCard({ mode }) {
  const uid = `m${useId().replace(/:/g, '')}`
  const Art = mode.art
  const ready = Boolean(mode.to)
  return (
    <article
      className={`mode-card ${ready ? '' : 'is-upcoming'}`}
      style={{ '--accent': mode.color, '--accent-2': mode.color2, '--on-accent': mode.onAccent ?? '#fff' }}
    >
      <div className="mode-art">
        <svg viewBox="0 0 360 200" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <Art uid={uid} />
        </svg>
        <span className="mode-tag"><Icon name={mode.icon} size={14} /> {mode.tag}</span>
      </div>
      <div className="mode-body">
        <h3>{mode.title}</h3>
        <p>{mode.description}</p>
        <ul className="mode-features">
          {mode.features.map((f) => (
            <li key={f}><Icon name="check" size={14} strokeWidth={2.4} /> {f}</li>
          ))}
        </ul>
      </div>
      <div className="mode-foot">
        {ready ? (
          <Button to={mode.to} className="mode-play"><Icon name="play" size={14} /> Play Now</Button>
        ) : (
          <>
            <Button className="mode-play" disabled aria-describedby={`${uid}-soon`}>
              <Icon name="play" size={14} /> Play Now
            </Button>
            <span className="soon-badge" id={`${uid}-soon`}><Icon name="clock" size={13} /> Arrives in Phase {mode.phase}</span>
          </>
        )}
      </div>
    </article>
  )
}
