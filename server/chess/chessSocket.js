// Socket.IO handlers for Online Match (namespace /chess).
// Every client message is validated; the server is the only source of truth for the game.
import { networkInterfaces } from 'node:os'
import { randomUUID } from 'node:crypto'
import { opposite } from '../../src/games/chess/services/chessService.js'
import { RECONNECT_GRACE_MS } from './config.js'
import { applyMove, checkFlag, finish, msUntilFlag } from './gameManager.js'
import { CODE_RE, RoomManager } from './roomManager.js'

const SQUARE_RE = /^[a-h][1-8]$/
const PLAYER_ID_RE = /^[\w-]{8,64}$/

const cleanName = (n) => (typeof n === 'string' ? n.replace(/\s+/g, ' ').trim().slice(0, 20) : '') || 'Player'
const cleanCode = (c) => (typeof c === 'string' ? c.trim().toUpperCase() : '')
const cleanPlayerId = (id) => (typeof id === 'string' && PLAYER_ID_RE.test(id) ? id : randomUUID())

export function lanAddresses() {
  return Object.values(networkInterfaces())
    .flat()
    .filter((i) => i && i.family === 'IPv4' && !i.internal)
    .map((i) => i.address)
}

export function registerChessSocket(io, rooms = new RoomManager()) {
  const nsp = io.of('/chess')

  const broadcast = (room) => {
    for (const c of ['w', 'b']) {
      const s = room.seats[c]
      if (s?.connected && s.socketId) nsp.to(s.socketId).emit('state', rooms.publicState(room, c))
    }
  }

  const endMatch = (room) => {
    room.status = 'finished'
    room.lastActivity = Date.now()
    clearTimeout(room.timers.flag)
    clearTimeout(room.timers.grace.w)
    clearTimeout(room.timers.grace.b)
    broadcast(room)
  }

  // Server-side flag fall: fires exactly when the running clock hits zero.
  const scheduleFlag = (room) => {
    clearTimeout(room.timers.flag)
    const ms = room.game ? msUntilFlag(room.game) : null
    if (ms == null) return
    room.timers.flag = setTimeout(() => {
      if (!room.game || room.status !== 'playing') return
      if (checkFlag(room.game)) endMatch(room)
      else scheduleFlag(room)
    }, ms + 20)
  }

  const attach = (socket, room, seat) => {
    // A newer connection for the same seat (e.g. a reload) takes over from the old one.
    if (seat.socketId && seat.socketId !== socket.id) {
      const old = nsp.sockets.get(seat.socketId)
      if (old) {
        old.data.roomCode = null
        old.emit('session_replaced')
      }
    }
    seat.socketId = socket.id
    seat.connected = true
    seat.disconnectedAt = null
    clearTimeout(room.timers.grace[seat.color])
    socket.data.roomCode = room.code
    room.lastActivity = Date.now()
  }

  const currentSeat = (socket) => {
    const room = socket.data.roomCode ? rooms.get(socket.data.roomCode) : null
    const seat = room ? rooms.seatBySocket(room, socket.id) : null
    return room && seat ? { room, seat } : null
  }

  /** Voluntary leave: forfeits a game in progress; frees the room if nobody is left. */
  const leave = (socket) => {
    const cur = currentSeat(socket)
    socket.data.roomCode = null
    if (!cur) return
    const { room, seat } = cur
    seat.left = true
    seat.connected = false
    seat.socketId = null
    if (room.status === 'playing' && finish(room.game, opposite(seat.color), 'resignation')) endMatch(room)
    else broadcast(room)
    if (room.status === 'waiting') rooms.delete(room.code) // host cancelled before anyone joined
    rooms.sweep()
  }

  nsp.on('connection', (socket) => {
    socket.data.roomCode = null
    const on = (event, handler) =>
      socket.on(event, (payload, ack) => {
        const reply = typeof ack === 'function' ? ack : () => {}
        try {
          handler(payload && typeof payload === 'object' ? payload : {}, reply)
        } catch (err) {
          console.error(`[chess] ${event} failed:`, err)
          reply({ ok: false, error: 'SERVER_ERROR' })
        }
      })

    on('server_info', (_p, reply) => reply({ ok: true, lan: lanAddresses() }))

    on('create_room', (p, reply) => {
      if (currentSeat(socket)) leave(socket)
      const { room, seat } = rooms.create({
        name: cleanName(p.name),
        playerId: cleanPlayerId(p.playerId),
        timeControl: p.timeControl,
        colorPref: p.colorPref,
      })
      attach(socket, room, seat)
      reply({ ok: true, code: room.code, token: seat.token, color: seat.color, state: rooms.publicState(room, seat.color) })
    })

    on('join_room', (p, reply) => {
      const code = cleanCode(p.code)
      if (!CODE_RE.test(code)) return reply({ ok: false, error: 'INVALID_CODE' })
      const room = rooms.get(code)
      if (!room) return reply({ ok: false, error: 'NOT_FOUND' })
      if (currentSeat(socket)?.room === room) return reply({ ok: false, error: 'ALREADY_IN_ROOM' })
      const res = rooms.join(room, { name: cleanName(p.name), playerId: cleanPlayerId(p.playerId) })
      if (res.error) return reply({ ok: false, error: res.error })
      if (currentSeat(socket)) leave(socket)
      attach(socket, room, res.seat)
      rooms.startMatch(room)
      reply({ ok: true, code, token: res.seat.token, color: res.seat.color, state: rooms.publicState(room, res.seat.color) })
      broadcast(room)
    })

    on('rejoin', (p, reply) => {
      const room = rooms.get(cleanCode(p.code))
      if (!room) return reply({ ok: false, error: 'NOT_FOUND' })
      const seat = rooms.seatByToken(room, p.token)
      if (!seat) return reply({ ok: false, error: 'INVALID_SESSION' })
      attach(socket, room, seat)
      reply({ ok: true, code: room.code, color: seat.color, state: rooms.publicState(room, seat.color) })
      broadcast(room)
    })

    on('move', (p, reply) => {
      const cur = currentSeat(socket)
      if (!cur) return reply({ ok: false, error: 'NOT_IN_ROOM' })
      const { room, seat } = cur
      if (room.status !== 'playing') return reply({ ok: false, error: 'GAME_NOT_ACTIVE' })
      if (!SQUARE_RE.test(p.from) || !SQUARE_RE.test(p.to)) return reply({ ok: false, error: 'BAD_REQUEST' })
      const promotion = p.promotion == null ? undefined : String(p.promotion)
      if (promotion && !/^[qrbn]$/.test(promotion)) return reply({ ok: false, error: 'BAD_REQUEST' })
      const ply = Number.isInteger(p.ply) ? p.ply : null

      const res = applyMove(room.game, seat.color, { from: p.from, to: p.to, promotion }, ply)
      if (!res.ok) {
        reply({ ok: false, error: res.reason, state: rooms.publicState(room, seat.color) })
        if (room.game.result && room.status === 'playing') endMatch(room)
        return
      }
      room.lastActivity = Date.now()
      reply({ ok: true })
      if (room.game.result) endMatch(room)
      else {
        scheduleFlag(room)
        broadcast(room)
      }
    })

    on('resign', (_p, reply) => {
      const cur = currentSeat(socket)
      if (!cur || cur.room.status !== 'playing') return reply({ ok: false, error: 'GAME_NOT_ACTIVE' })
      finish(cur.room.game, opposite(cur.seat.color), 'resignation')
      endMatch(cur.room)
      reply({ ok: true })
    })

    on('rematch', (p, reply) => {
      const cur = currentSeat(socket)
      if (!cur || cur.room.status !== 'finished') return reply({ ok: false, error: 'GAME_NOT_FINISHED' })
      const { room, seat } = cur
      const opp = room.seats[opposite(seat.color)]
      if (!opp || opp.left) return reply({ ok: false, error: 'OPPONENT_LEFT' })
      room.rematch[seat.color] = p.cancel ? false : true
      if (room.rematch.w && room.rematch.b) {
        rooms.swapSeats(room)
        rooms.startMatch(room)
      }
      room.lastActivity = Date.now()
      reply({ ok: true })
      broadcast(room)
    })

    on('leave_room', (_p, reply) => {
      leave(socket)
      reply({ ok: true })
    })

    socket.on('disconnect', () => {
      const cur = currentSeat(socket)
      if (!cur) return
      const { room, seat } = cur
      seat.connected = false
      seat.socketId = null
      seat.disconnectedAt = Date.now()
      room.lastActivity = Date.now()
      // Hold the seat mid-game; if they don't come back in time, the opponent wins.
      if (room.status === 'playing') {
        clearTimeout(room.timers.grace[seat.color])
        room.timers.grace[seat.color] = setTimeout(() => {
          if (room.status === 'playing' && !seat.connected && finish(room.game, opposite(seat.color), 'abandoned')) endMatch(room)
        }, RECONNECT_GRACE_MS)
      }
      broadcast(room)
    })
  })

  return { nsp, rooms }
}
