import Icon from '../../../components/ui/Icon'

export default function GameStatus({ status }) {
  const tone = status.over ? (status.winner ? 'win' : 'draw') : status.inCheck ? 'check' : 'turn'
  return (
    <div className={`game-status tone-${tone}`} role="status" aria-live="polite">
      <span className={`turn-dot dot-${status.turn}`} aria-hidden="true" />
      <span>{status.label}</span>
      {status.over && <Icon name={status.winner ? 'trophy' : 'refresh'} size={16} />}
    </div>
  )
}
