// Authoritative game state for one room: board (chess.js), clocks and result.
// Clients only ever send { from, to, promotion }; everything is validated here.
import { createGame, getStatus, hasMatingMaterial, opposite } from '../../src/games/chess/services/chessService.js'
import { CLOCK_SCALE, TIME_CONTROLS } from './config.js'

export function newGame(timeControl) {
  const base = TIME_CONTROLS[timeControl]
  const ms = base == null ? null : Math.round(base * CLOCK_SCALE)
  return {
    chess: createGame(),
    clock: ms == null ? null : { w: ms, b: ms, running: null, since: 0 },
    result: null, // { winner: 'w'|'b'|null, reason }
  }
}

const now = () => Date.now()

/** Remaining time for `color` right now (running side is computed live). */
export function remaining(game, color) {
  const c = game.clock
  if (!c) return null
  return c.running === color ? Math.max(0, c[color] - (now() - c.since)) : c[color]
}

function stopClock(game) {
  const c = game.clock
  if (!c || !c.running) return
  c[c.running] = remaining(game, c.running)
  c.running = null
}

function startClock(game, color) {
  const c = game.clock
  if (!c) return
  c.running = color
  c.since = now()
}

export function finish(game, winner, reason) {
  if (game.result) return false
  stopClock(game)
  game.result = { winner, reason }
  return true
}

/**
 * Validates and applies a move.
 * @returns {{ ok: true, move } | { ok: false, reason }}
 */
export function applyMove(game, color, { from, to, promotion }, expectedPly) {
  if (game.result) return { ok: false, reason: 'GAME_OVER' }
  const chess = game.chess
  if (chess.turn() !== color) return { ok: false, reason: 'NOT_YOUR_TURN' }
  // Guards against duplicate / stale submissions (e.g. a resend after reconnect).
  if (expectedPly != null && expectedPly !== chess.history().length) return { ok: false, reason: 'STALE_POSITION' }

  // A flag may have fallen before this move arrived.
  if (game.clock && remaining(game, color) <= 0) {
    checkFlag(game)
    return { ok: false, reason: 'GAME_OVER' }
  }

  let move
  try {
    move = chess.move({ from, to, promotion })
  } catch {
    return { ok: false, reason: 'ILLEGAL_MOVE' }
  }

  // Clocks: the mover's time is banked; the opponent's clock starts.
  // (Clocks begin after White's first move, as in Friend vs Friend.)
  if (game.clock) {
    stopClock(game)
    startClock(game, opposite(color))
  }

  const status = getStatus(chess)
  if (status.over) finish(game, status.winner, status.reason)
  return { ok: true, move }
}

/** Ends the game on time if the running side has flagged. Returns true if it ended. */
export function checkFlag(game) {
  const c = game.clock
  if (!c || !c.running || game.result) return false
  const side = c.running
  if (remaining(game, side) > 0) return false
  c[side] = 0
  const other = opposite(side)
  const board = game.chess.board()
  return hasMatingMaterial(board, other) ? finish(game, other, 'timeout') : finish(game, null, 'timeout-insufficient')
}

/** ms until the running clock would flag (for scheduling), or null. */
export function msUntilFlag(game) {
  const c = game.clock
  if (!c || !c.running || game.result) return null
  return remaining(game, c.running)
}

export function publicGame(game) {
  const history = game.chess.history({ verbose: true })
  return {
    moves: history.map((m) => m.lan),
    fen: game.chess.fen(),
    turn: game.chess.turn(),
    result: game.result,
    clock: game.clock ? { w: remaining(game, 'w'), b: remaining(game, 'b'), running: game.clock.running } : null,
  }
}
