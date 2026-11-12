import { PIECE_PATHS } from './pieces'

export function Piece({ type, x = 0, y = 0, scale = 1, fill, stroke, strokeWidth = 1.6, filter, flip = false, className }) {
  const t = `translate(${x} ${y}) scale(${flip ? -scale : scale} ${scale})${flip ? ' translate(-45 0)' : ''}`
  return (
    <g transform={t} filter={filter} className={className}>
      {PIECE_PATHS[type].map((d, i) => (
        <path key={i} d={d} fill={i === 0 && type === 'king' ? 'none' : fill} stroke={stroke} strokeWidth={strokeWidth}
          strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      ))}
    </g>
  )
}
