import { readJSON } from '../../../services/storage'

// Local chess statistics. One record per finished match, so stats are always derived,
// never double-counted. Shape is account-ready: each match carries the player's colour,
// mode and (for online) the server match id, so it can later be synced to a user account.
export const CHESS_STORAGE_KEY = 'playverse:chess'
export const EMPTY_CHESS = { version: 1, matches: [] }

export const MODES = {
  local: { label: 'Friend vs Friend', short: 'Friend' },
  computer: { label: 'Computer vs You', short: 'Computer' },
  online: { label: 'Online Match', short: 'Online' },
}

export const TIME_CONTROLS = [
  { id: 'bullet', label: 'Bullet', detail: '1 min', ms: 60_000 },
  { id: 'blitz', label: 'Blitz', detail: '3 min', ms: 180_000 },
  { id: 'rapid', label: 'Rapid', detail: '10 min', ms: 600_000 },
  { id: 'unlimited', label: 'Unlimited', detail: 'No timer', ms: null },
]
export const getTimeControl = (id) => TIME_CONTROLS.find((t) => t.id === id) ?? TIME_CONTROLS[3]

export const REASON_LABEL = {
  checkmate: 'Checkmate',
  resignation: 'Resignation',
  timeout: 'Time out',
  'timeout-insufficient': 'Time out vs insufficient material',
  stalemate: 'Stalemate',
  repetition: 'Threefold repetition',
  'fifty-move': 'Fifty-move rule',
  insufficient: 'Insufficient material',
  agreement: 'Draw by agreement',
}

/** Appends a finished match (keeps the last 300). */
export const addMatch = (data, match) => ({
  ...EMPTY_CHESS,
  ...data,
  matches: [...(data?.matches ?? []), match].slice(-300),
})

export const AI_LEVELS = [
  { id: 'beginner', label: 'Beginner' },
  { id: 'easy', label: 'Easy' },
  { id: 'medium', label: 'Medium' },
  { id: 'hard', label: 'Hard' },
  { id: 'expert', label: 'Expert' },
]

/**
 * match = {
 *   id, mode: 'local'|'computer'|'online', at (ms),
 *   result: 'win'|'loss'|'draw'  — from the device owner's point of view
 *           (local games: 'white'|'black'|'draw' — winner colour, no personal result),
 *   playerColor, opponent, difficulty?, reason, moves, pgn?, serverMatchId?
 * }
 */
export function summarize(data) {
  const matches = data?.matches ?? []
  const personal = matches.filter((m) => m.mode !== 'local')
  const count = (r) => personal.filter((m) => m.result === r).length
  const wins = count('win'), losses = count('loss'), draws = count('draw')

  let best = 0, run = 0
  for (const m of personal) {
    run = m.result === 'win' ? run + 1 : 0
    best = Math.max(best, run)
  }

  const byMode = Object.keys(MODES).map((id) => ({ id, n: matches.filter((m) => m.mode === id).length }))
  const top = byMode.sort((a, b) => b.n - a.n)[0]

  const ai = Object.fromEntries(
    AI_LEVELS.map(({ id }) => {
      const games = matches.filter((m) => m.mode === 'computer' && m.difficulty === id)
      return [id, { win: games.filter((m) => m.result === 'win').length, loss: games.filter((m) => m.result === 'loss').length, draw: games.filter((m) => m.result === 'draw').length }]
    }),
  )

  return {
    total: matches.length,
    wins, losses, draws,
    winPct: personal.length ? Math.round((wins / personal.length) * 100) : 0,
    bestStreak: best,
    favoriteMode: top?.n ? top.id : null,
    ai,
    recent: [...matches].sort((a, b) => b.at - a.at).slice(0, 8),
  }
}

export const readChessSummary = () => summarize(readJSON(CHESS_STORAGE_KEY, EMPTY_CHESS))
