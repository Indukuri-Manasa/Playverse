import CapturedPieces from './CapturedPieces'
import { COLOR_NAME } from '../services/chessService'

export default function PlayerBar({ color, name, material, active, thinking, extra }) {
  return (
    <div className={`player-bar ${active ? 'is-active' : ''}`}>
      <span className={`player-swatch swatch-${color}`} aria-hidden="true" />
      <span className="player-name">
        <strong>{name ?? COLOR_NAME[color]}</strong>
        {thinking && <small className="thinking">thinking…</small>}
      </span>
      <CapturedPieces material={material} color={color} />
      {extra}
    </div>
  )
}
