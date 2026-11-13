// Tunables (env overrides exist so automated tests can run fast).
const num = (v, d) => (v != null && v !== '' && !Number.isNaN(Number(v)) ? Number(v) : d)

export const CLOCK_SCALE = num(process.env.CHESS_CLOCK_SCALE, 1) // e.g. 0.01 in tests
export const RECONNECT_GRACE_MS = num(process.env.CHESS_GRACE_MS, 60_000) // disconnected player's seat is held this long mid-game
export const EMPTY_ROOM_TTL_MS = num(process.env.CHESS_EMPTY_TTL_MS, 2 * 60_000) // room with nobody connected
export const FINISHED_ROOM_TTL_MS = num(process.env.CHESS_FINISHED_TTL_MS, 15 * 60_000) // idle finished room
export const SWEEP_INTERVAL_MS = num(process.env.CHESS_SWEEP_MS, 30_000)

export const TIME_CONTROLS = {
  bullet: 60_000,
  blitz: 180_000,
  rapid: 600_000,
  unlimited: null,
}
