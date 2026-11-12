import { useMemo, useRef } from 'react'
import ChessPiece, { PieceDefs } from './ChessPiece'
import PromotionDialog from './PromotionDialog'

const FILES = 'abcdefgh'

// Board <-> screen mapping. row/col are screen positions (0,0 = top-left).
function squareAt(row, col, orientation) {
  return orientation === 'w' ? `${FILES[col]}${8 - row}` : `${FILES[7 - col]}${row + 1}`
}
function screenPos(square, orientation) {
  const f = FILES.indexOf(square[0]), r = Number(square[1])
  return orientation === 'w' ? { row: 8 - r, col: f } : { row: r - 1, col: 7 - f }
}
const transformFor = (square, orientation) => {
  const { row, col } = screenPos(square, orientation)
  return `translate(${col * 100}%, ${row * 100}%)`
}

/**
 * Keeps a stable id per physical piece between positions so React can animate moves
 * (including castling rooks, undo and reset) instead of re-mounting pieces.
 */
function reconcile(prev, board) {
  const next = []
  for (const row of board) for (const sq of row) if (sq) next.push({ square: sq.square, type: sq.type, color: sq.color })
  const unused = [...prev]
  const take = (i) => unused.splice(i, 1)[0].id
  const dist = (a, b) => Math.abs(a.charCodeAt(0) - b.charCodeAt(0)) + Math.abs(a[1] - b[1])
  const out = new Array(next.length)
  // 1) unchanged squares
  next.forEach((p, i) => {
    const j = unused.findIndex((u) => u.square === p.square && u.type === p.type && u.color === p.color)
    if (j >= 0) out[i] = { ...p, id: take(j) }
  })
  // 2) moved pieces (same kind, nearest), 3) promotions (same colour pawn), 4) new pieces
  for (const pass of ['same', 'pawn', 'new']) {
    next.forEach((p, i) => {
      if (out[i]) return
      let best = -1
      unused.forEach((u, j) => {
        const fits = pass === 'same' ? u.type === p.type && u.color === p.color : pass === 'pawn' ? u.type === 'p' && u.color === p.color : false
        if (fits && (best < 0 || dist(u.square, p.square) < dist(unused[best].square, p.square))) best = j
      })
      if (best >= 0) out[i] = { ...p, id: take(best) }
      else if (pass === 'new') out[i] = { ...p, id: `${p.color}${p.type}-${p.square}-${Math.random().toString(36).slice(2, 7)}` }
    })
  }
  return out
}

/**
 * Presentational chessboard. All rules live in chess.js (via useChessGame);
 * the board only reports intents: onSelect(square) and onMove(from, to).
 */
export default function ChessBoard({
  board,
  orientation = 'w',
  selected,
  legalTargets = [],
  lastMove,
  checkSquare,
  canMovePiece = () => false,
  onSelect,
  onMove,
  pendingPromotion,
  onPromote,
  onCancelPromotion,
  showLegal = true,
  showLastMove = true,
  showCoords = true,
  disabled = false,
  theme = 'neon',
}) {
  const boardRef = useRef(null)
  const drag = useRef(null)
  const piecesRef = useRef([])

  const pieces = useMemo(() => {
    piecesRef.current = reconcile(piecesRef.current, board)
    return piecesRef.current
  }, [board])

  const targets = useMemo(() => {
    const map = {}
    for (const m of legalTargets) map[m.to] = m.captured || m.flags.includes('e') ? 'capture' : 'move'
    return map
  }, [legalTargets])

  function squareFromPoint(clientX, clientY) {
    const rect = boardRef.current.getBoundingClientRect()
    const col = Math.floor(((clientX - rect.left) / rect.width) * 8)
    const row = Math.floor(((clientY - rect.top) / rect.height) * 8)
    if (row < 0 || row > 7 || col < 0 || col > 7) return null
    return squareAt(row, col, orientation)
  }

  const pieceEl = (square) => boardRef.current?.querySelector(`.board-piece[data-square="${square}"]`)

  function onPointerDown(e) {
    if (disabled || pendingPromotion || e.button > 0) return
    const square = squareFromPoint(e.clientX, e.clientY)
    if (!square) return
    // Second click on a highlighted destination: move.
    if (selected && targets[square] && square !== selected) {
      onMove(selected, square)
      return
    }
    if (canMovePiece(square)) {
      const wasSelected = selected === square
      onSelect(square)
      const rect = boardRef.current.getBoundingClientRect()
      drag.current = { from: square, el: pieceEl(square), wasSelected, x: e.clientX, y: e.clientY, moved: false, rect }
      boardRef.current.setPointerCapture(e.pointerId)
      e.preventDefault()
    } else {
      onSelect(null)
    }
  }

  function onPointerMove(e) {
    const d = drag.current
    if (!d?.el) return
    if (!d.moved && Math.hypot(e.clientX - d.x, e.clientY - d.y) < 4) return
    d.moved = true
    const size = d.rect.width / 8
    d.el.classList.add('dragging')
    d.el.style.transform = `translate(${e.clientX - d.rect.left - size / 2}px, ${e.clientY - d.rect.top - size / 2}px)`
  }

  function endDrag(e, cancelled = false) {
    const d = drag.current
    if (!d) return
    drag.current = null
    if (d.el) {
      d.el.classList.remove('dragging')
      d.el.style.transform = transformFor(d.from, orientation) // snap back; React moves it if the move is legal
    }
    if (cancelled) return
    const square = squareFromPoint(e.clientX, e.clientY)
    if (d.moved && square && square !== d.from) onMove(d.from, square)
    else if (!d.moved && d.wasSelected) onSelect(null)
  }

  const squares = []
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const sq = squareAt(row, col, orientation)
      const light = (row + col) % 2 === 0
      const cls = [
        'sq',
        light ? 'sq-light' : 'sq-dark',
        showLastMove && lastMove && (lastMove.from === sq || lastMove.to === sq) ? 'sq-last' : '',
        selected === sq ? 'sq-selected' : '',
        checkSquare === sq ? 'sq-check' : '',
        showLegal && targets[sq] ? `sq-target sq-${targets[sq]}` : '',
      ].join(' ')
      squares.push(
        <div key={sq} className={cls} data-square={sq}>
          {showCoords && col === 0 && <span className="coord coord-rank">{sq[1]}</span>}
          {showCoords && row === 7 && <span className="coord coord-file">{sq[0]}</span>}
        </div>,
      )
    }
  }

  return (
    <div className={`chess-board-wrap theme-${theme}`}>
      <PieceDefs />
      <div
        ref={boardRef}
        className={`chess-board ${disabled ? 'is-disabled' : ''}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={(e) => endDrag(e)}
        onPointerCancel={(e) => endDrag(e, true)}
        onContextMenu={(e) => e.preventDefault()}
        role="grid"
        aria-label="Chessboard"
      >
        <div className="board-squares">{squares}</div>
        <div className="board-pieces">
          {pieces.map((p) => (
            <div
              key={p.id}
              className={`board-piece ${canMovePiece(p.square) && !disabled ? 'movable' : ''}`}
              data-square={p.square}
              style={{ transform: transformFor(p.square, orientation) }}
            >
              <ChessPiece type={p.type} color={p.color} />
            </div>
          ))}
        </div>
        {pendingPromotion && (
          <PromotionDialog color={pendingPromotion.color} onPick={onPromote} onCancel={onCancelPromotion} />
        )}
      </div>
    </div>
  )
}
