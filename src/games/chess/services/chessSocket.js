import { io } from 'socket.io-client'

// Same origin as the app: Vite (dev) or server/index.js --serve (prod) forwards /socket.io
// to the game server, so this works on localhost and from other devices on the network.
export function connectChess() {
  return io('/chess', { path: '/socket.io', reconnectionDelayMax: 4000, timeout: 8000 })
}

/** emit with acknowledgement + timeout → always resolves to { ok, error?, … } */
export function call(socket, event, payload = {}, timeout = 8000) {
  return new Promise((resolve) => {
    if (!socket?.connected) return resolve({ ok: false, error: 'OFFLINE' })
    socket.timeout(timeout).emit(event, payload, (err, res) => resolve(err ? { ok: false, error: 'TIMEOUT' } : res ?? { ok: false }))
  })
}

export const ONLINE_ERRORS = {
  NOT_FOUND: 'No room with that code. Check it and try again.',
  ROOM_FULL: 'That room already has two players.',
  INVALID_CODE: 'Room codes are 6 letters or numbers.',
  INVALID_SESSION: 'Your seat in that room is no longer available.',
  ALREADY_IN_ROOM: 'You are already in that room.',
  OPPONENT_LEFT: 'Your opponent has left the room.',
  TIMEOUT: 'The server took too long to respond.',
  OFFLINE: 'Not connected to the game server.',
  SERVER_ERROR: 'Something went wrong on the server.',
}
export const errorText = (code) => ONLINE_ERRORS[code] ?? 'Something went wrong.'

// Stable per-device id (for stats; future accounts can map to it). Not a secret.
const PLAYER_KEY = 'playverse:chess-player-id'
export function getPlayerId() {
  try {
    let id = localStorage.getItem(PLAYER_KEY)
    if (!id) {
      id = crypto.randomUUID?.() ?? `p-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`
      localStorage.setItem(PLAYER_KEY, id)
    }
    return id
  } catch {
    return `p-${Date.now().toString(36)}`
  }
}

// Seat session (room code + secret token) per browser tab, so a reload reconnects to the
// same seat while a second tab can still join as the opponent.
const SESSION_KEY = 'playverse:chess-online-session'
export const session = {
  read() {
    try { return JSON.parse(sessionStorage.getItem(SESSION_KEY)) } catch { return null }
  },
  save(s) {
    try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(s)) } catch { /* private mode */ }
  },
  clear() {
    try { sessionStorage.removeItem(SESSION_KEY) } catch { /* private mode */ }
  },
}
