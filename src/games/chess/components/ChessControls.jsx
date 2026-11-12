import { useEffect, useState } from 'react'
import Button from '../../../components/ui/Button'
import Icon from '../../../components/ui/Icon'

// Two-step confirm for destructive actions (no browser dialogs mid-game).
function useArmed(ms = 3000) {
  const [armed, setArmed] = useState(null)
  useEffect(() => {
    if (!armed) return
    const id = setTimeout(() => setArmed(null), ms)
    return () => clearTimeout(id)
  }, [armed, ms])
  return [armed, setArmed]
}

export default function ChessControls({ onUndo, canUndo, onFlip, onResign, resignLabel, onRestart, confirmRestart, disabled }) {
  const [armed, setArmed] = useArmed()

  function confirmable(key, action, needsConfirm = true) {
    if (!needsConfirm || armed === key) {
      setArmed(null)
      action()
    } else setArmed(key)
  }

  return (
    <div className="chess-controls">
      <Button variant="secondary" size="sm" onClick={onUndo} disabled={!canUndo}>
        <Icon name="arrowLeft" size={15} /> Undo
      </Button>
      <Button variant="secondary" size="sm" onClick={onFlip}>
        <Icon name="refresh" size={15} /> Flip
      </Button>
      <Button
        variant={armed === 'restart' ? 'danger' : 'ghost'}
        size="sm"
        onClick={() => confirmable('restart', onRestart, confirmRestart)}
      >
        <Icon name="shuffle" size={15} /> {armed === 'restart' ? 'Confirm restart?' : 'Restart'}
      </Button>
      {onResign && (
        <Button
          variant="danger"
          size="sm"
          onClick={() => confirmable('resign', onResign)}
          disabled={disabled}
          className={armed === 'resign' ? 'is-armed' : ''}
        >
          <Icon name="close" size={15} /> {armed === 'resign' ? 'Tap again to resign' : resignLabel ?? 'Resign'}
        </Button>
      )}
    </div>
  )
}
