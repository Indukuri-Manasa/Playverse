// Rooms, seats and lifecycle. One room = two seats (white/black) + one game.
import { randomBytes, randomInt } from 'node:crypto'
import { EMPTY_ROOM_TTL_MS, FINISHED_ROOM_TTL_MS, RECONNECT_GRACE_MS, TIME_CONTROLS } from './config.js'
import { newGame, publicGame } from './gameManager.js'

// No 0/O or 1/I/L — codes are read aloud and typed on phones.
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
export const CODE_RE = /^[A-Z2-9]{6}$/

export class RoomManager {
  constructor() {
    this.rooms = new Map()
  }

  generateCode() {
    for (let i = 0; i < 1000; i++) {
      let code = ''
      for (let j = 0; j < 6; j++) code += ALPHABET[randomInt(ALPHABET.length)]
      if (!this.rooms.has(code)) return code
    }
    throw new Error('Could not allocate a room code')
  }

  get(code) {
    return this.rooms.get(code) ?? null
  }

  create({ name, playerId, timeControl, colorPref }) {
    const code = this.generateCode()
    const hostColor = colorPref === 'w' || colorPref === 'b' ? colorPref : randomInt(2) ? 'w' : 'b'
    const room = {
      code,
      timeControl: timeControl in TIME_CONTROLS ? timeControl : 'blitz',
      createdAt: Date.now(),
      lastActivity: Date.now(),
      status: 'waiting', // waiting → playing → finished (→ playing again on rematch)
      seats: { w: null, b: null },
      game: null,
      matchNo: 0,
      matchId: null,
      rematch: { w: false, b: false },
      timers: { flag: null, grace: { w: null, b: null } },
    }
    const seat = this.makeSeat({ name, playerId, color: hostColor })
    room.seats[hostColor] = seat
    this.rooms.set(code, room)
    return { room, seat }
  }

  makeSeat({ name, playerId, color }) {
    return {
      color,
      name,
      playerId,
      token: randomBytes(18).toString('base64url'), // secret proving seat ownership
      socketId: null,
      connected: false,
      left: false,
      disconnectedAt: null,
    }
  }

  /** Fill the free seat. Returns { seat } or { error }. */
  join(room, { name, playerId }) {
    if (room.status !== 'waiting') return { error: 'ROOM_FULL' }
    const free = !room.seats.w ? 'w' : !room.seats.b ? 'b' : null
    if (!free) return { error: 'ROOM_FULL' }
    const seat = this.makeSeat({ name, playerId, color: free })
    room.seats[free] = seat
    return { seat }
  }

  startMatch(room) {
    room.matchNo += 1
    room.matchId = `${room.code}-${room.matchNo}-${Date.now().toString(36)}`
    room.game = newGame(room.timeControl)
    room.status = 'playing'
    room.rematch = { w: false, b: false }
  }

  /** Rematch: players swap colours. */
  swapSeats(room) {
    const { w, b } = room.seats
    room.seats = { w: b, b: w }
    if (room.seats.w) room.seats.w.color = 'w'
    if (room.seats.b) room.seats.b.color = 'b'
  }

  seatByToken(room, token) {
    if (typeof token !== 'string') return null
    for (const c of ['w', 'b']) {
      const s = room.seats[c]
      if (s && !s.left && s.token === token) return s
    }
    return null
  }

  seatBySocket(room, socketId) {
    for (const c of ['w', 'b']) if (room.seats[c]?.socketId === socketId) return room.seats[c]
    return null
  }

  delete(code) {
    const room = this.rooms.get(code)
    if (!room) return
    clearTimeout(room.timers.flag)
    clearTimeout(room.timers.grace.w)
    clearTimeout(room.timers.grace.b)
    this.rooms.delete(code)
  }

  /** Removes abandoned rooms. Returns the codes deleted. */
  sweep(at = Date.now()) {
    const removed = []
    for (const [code, room] of this.rooms) {
      const anyoneHere = ['w', 'b'].some((c) => room.seats[c]?.connected)
      const idle = at - room.lastActivity
      const emptyTooLong = !anyoneHere && idle > EMPTY_ROOM_TTL_MS
      const finishedTooLong = room.status === 'finished' && idle > FINISHED_ROOM_TTL_MS
      const everyoneLeft = ['w', 'b'].every((c) => !room.seats[c] || room.seats[c].left)
      if (emptyTooLong || finishedTooLong || everyoneLeft) {
        this.delete(code)
        removed.push(code)
      }
    }
    return removed
  }

  /** Snapshot sent to clients (never includes tokens or socket ids). */
  publicState(room, forColor = null) {
    const seat = (c) => {
      const s = room.seats[c]
      return s ? { name: s.name, connected: s.connected, left: s.left, disconnectedAt: s.disconnectedAt } : null
    }
    return {
      code: room.code,
      status: room.status,
      timeControl: room.timeControl,
      matchId: room.matchId,
      players: { w: seat('w'), b: seat('b') },
      rematch: room.rematch,
      game: room.game ? publicGame(room.game) : null,
      you: forColor,
      reconnectGraceMs: RECONNECT_GRACE_MS,
      serverTime: Date.now(),
    }
  }
}
