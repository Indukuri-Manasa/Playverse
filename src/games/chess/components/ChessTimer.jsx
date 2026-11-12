import { formatClock } from '../hooks/useChessClock'

export default function ChessTimer({ ms, running, initialMs }) {
  const low = ms < Math.min(20_000, initialMs * 0.15)
  return (
    <span className={`chess-timer ${running ? 'running' : ''} ${low ? 'low' : ''} ${ms <= 0 ? 'flagged' : ''}`} role="timer" aria-live="off">
      {formatClock(ms)}
    </span>
  )
}
