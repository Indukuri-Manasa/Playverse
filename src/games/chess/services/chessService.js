import { Chess, validateFen } from 'chess.js'

// All chess rules come from chess.js — this module only shapes its output for the UI.
// Nothing here moves pieces by itself; every move goes through chess.move(), which rejects illegal moves.

export const START_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
export const COLOR_NAME = { w: 'White', b: 'Black' }
export const PIECE_NAME = { p: 'pawn', n: 'knight', b: 'bishop', r: 'rook', q: 'queen', k: 'king' }
export const PIECE_VALUE = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 }

export const createGame = (fen) => new Chess(fen ?? START_FEN)

export function checkFen(fen) {
  const { ok, error } = validateFen(fen.trim())
  return ok ? { ok } : { ok: false, error: error.replace(/^Invalid FEN: /, '') }
}

/** Game-over / check state from the side-to-move's perspective. */
export function getStatus(chess) {
  const turn = chess.turn()
  const inCheck = chess.inCheck()
  if (chess.isCheckmate()) {
    const winner = turn === 'w' ? 'b' : 'w'
    return { over: true, turn, inCheck, winner, reason: 'checkmate', label: `Checkmate — ${COLOR_NAME[winner]} wins` }
  }
  if (chess.isStalemate()) return draw(turn, 'stalemate', 'Draw by stalemate')
  if (chess.isInsufficientMaterial()) return draw(turn, 'insufficient', 'Draw — insufficient material')
  if (chess.isThreefoldRepetition()) return draw(turn, 'repetition', 'Draw by threefold repetition')
  if (chess.isDrawByFiftyMoves()) return draw(turn, 'fifty-move', 'Draw by the fifty-move rule')
  return {
    over: false, turn, inCheck, winner: null, reason: null,
    label: `${COLOR_NAME[turn]} to move${inCheck ? ' — check!' : ''}`,
  }
}
const draw = (turn, reason, label) => ({ over: true, turn, inCheck: false, winner: null, reason, label })

/** Legal moves grouped by origin square: { e2: [move, …] }. */
export function legalMovesByFrom(chess) {
  const map = {}
  for (const m of chess.moves({ verbose: true })) (map[m.from] ??= []).push(m)
  return map
}

/**
 * Captured pieces come from the moves actually played (correct for loaded positions too);
 * the material lead comes from the pieces on the board.
 */
export function capturedPieces(chess, history = chess.history({ verbose: true })) {
  const order = { q: 0, r: 1, b: 2, n: 3, p: 4 }
  const capturedBy = { w: [], b: [] } // capturedBy.w = black pieces White has taken
  for (const m of history) if (m.captured) capturedBy[m.color].push(m.captured)
  capturedBy.w.sort((x, y) => order[x] - order[y])
  capturedBy.b.sort((x, y) => order[x] - order[y])

  let diff = 0
  for (const row of chess.board()) for (const sq of row) if (sq) diff += (sq.color === 'w' ? 1 : -1) * PIECE_VALUE[sq.type]
  return { capturedBy, advantage: { w: Math.max(0, diff), b: Math.max(0, -diff) } }
}

export function kingSquare(chess, color) {
  return chess.findPiece({ type: 'k', color })[0] ?? null
}

/** Everything the UI needs, captured after each change. */
export function snapshot(chess) {
  const history = chess.history({ verbose: true })
  const last = history.at(-1)
  const status = getStatus(chess)
  return {
    fen: chess.fen(),
    pgn: chess.pgn(),
    board: chess.board(),
    turn: chess.turn(),
    history,
    lastMove: last ? { from: last.from, to: last.to } : null,
    status,
    checkSquare: status.inCheck || status.reason === 'checkmate' ? kingSquare(chess, chess.turn()) : null,
    legal: status.over ? {} : legalMovesByFrom(chess),
    material: capturedPieces(chess, history),
  }
}

export const isPromotion = (moves, to) => moves?.some((m) => m.to === to && m.promotion)

/**
 * Can `color` still deliver mate with the material on the board?
 * Used when a flag falls: lone king, or king + single minor piece, cannot win → draw.
 */
export function hasMatingMaterial(board, color) {
  let minors = 0
  for (const row of board) {
    for (const sq of row) {
      if (!sq || sq.color !== color || sq.type === 'k') continue
      if (sq.type === 'p' || sq.type === 'r' || sq.type === 'q') return true
      minors += 1
    }
  }
  return minors >= 2
}

export const opposite = (color) => (color === 'w' ? 'b' : 'w')
