import Button from '../ui/Button'
import Icon from '../ui/Icon'
import ProgressRing from '../ui/ProgressRing'
import { challengeGame, challengeStatus, dailyChallenge } from '../../utils/daily'
import { accentVars } from '../../data/games'

function untilMidnight() {
  const now = new Date()
  const end = new Date(now)
  end.setHours(24, 0, 0, 0)
  const mins = Math.round((end - now) / 60000)
  return `${Math.floor(mins / 60)}h ${mins % 60}m`
}

export default function DailyChallenge({ activity }) {
  const challenge = dailyChallenge()
  const game = challengeGame(challenge)
  const status = challengeStatus(challenge, activity.daily)
  return (
    <article className={`panel challenge ${status.done ? 'is-done' : ''}`} style={accentVars(game)}>
      <div className="challenge-head">
        <span className="eyebrow"><Icon name="target" size={14} /> Daily Challenge</span>
        <span className="chip"><Icon name="clock" size={13} /> Resets in {untilMidnight()}</span>
      </div>
      <div className="challenge-body">
        <ProgressRing value={status.progress} color={game.color} size={104}>
          {status.done ? <Icon name="check" size={34} strokeWidth={2.6} /> : <strong>{Math.round(status.progress * 100)}%</strong>}
        </ProgressRing>
        <div>
          <h3>{challenge.title}</h3>
          <p className="muted">{status.done ? 'Completed — come back tomorrow for a new one.' : status.label}</p>
          <p className="challenge-reward"><Icon name="sparkle" size={14} /> +50 XP · counts toward Daily Grinder</p>
        </div>
      </div>
      <Button to={`/play/${game.id}`} variant={status.done ? 'secondary' : 'primary'}>
        <Icon name="play" size={14} /> {status.done ? 'Play again' : 'Take the challenge'}
      </Button>
    </article>
  )
}
