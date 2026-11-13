import { useCallback, useEffect, useRef, useState } from 'react'
import { call, connectChess, getPlayerId, session } from '../services/chessSocket'

/**
 * Connection + room state for Online Match.
 * conn: 'connecting' | 'online' | 'reconnecting' | 'offline'
 * room: latest server snapshot (+ receivedAt for clock interpolation), or null when not in a room
 */
export function useOnlineRoom() {
  const socketRef = useRef(null)
  const [conn, setConn] = useState('connecting')
  const [room, setRoom] = useState(null)
  const [lan, setLan] = useState([])
  const [notice, setNotice] = useState(null)

  const take = useCallback((state) => state && setRoom({ ...state, receivedAt: performance.now() }), [])

  useEffect(() => {
    const s = connectChess()
    socketRef.current = s
    s.on('connect', async () => {
      setConn('online')
      const info = await call(s, 'server_info')
      if (info.ok) setLan(info.lan)
      const saved = session.read()
      if (saved) {
        const res = await call(s, 'rejoin', saved)
        const st = res.state
        const oppLeft = st && st.players?.[st.you === 'w' ? 'b' : 'w']?.left
        if (res.ok && st.status === 'finished' && oppLeft) {
          // Nothing left to do in a finished room the opponent has left → back to the lobby.
          await call(s, 'leave_room')
          session.clear()
          setRoom(null)
        } else if (res.ok) take(res.state)
        else {
          session.clear()
          setRoom(null)
          setNotice(res.error === 'NOT_FOUND' ? 'That room has closed.' : 'Your previous game is no longer available.')
        }
      }
    })
    s.on('disconnect', () => setConn('reconnecting'))
    s.on('connect_error', () => setConn((c) => (c === 'connecting' || c === 'offline' ? 'offline' : 'reconnecting')))
    s.on('state', take)
    s.on('session_replaced', () => {
      session.clear()
      setRoom(null)
      setNotice('This game was opened in another tab or window, so it was disconnected here.')
    })
    return () => {
      s.removeAllListeners()
      s.disconnect()
    }
  }, [take])

  const enter = useCallback(
    (res) => {
      if (res.ok) {
        session.save({ code: res.code, token: res.token })
        setNotice(null)
        take(res.state)
      }
      return res
    },
    [take],
  )

  const createRoom = useCallback(
    async (opts) => enter(await call(socketRef.current, 'create_room', { ...opts, playerId: getPlayerId() })),
    [enter],
  )
  const joinRoom = useCallback(
    async (code, name) => enter(await call(socketRef.current, 'join_room', { code, name, playerId: getPlayerId() })),
    [enter],
  )
  const sendMove = useCallback(
    async (move) => {
      const res = await call(socketRef.current, 'move', move)
      if (!res.ok && res.state) take(res.state) // server said no → snap back to the server's position
      return res
    },
    [take],
  )
  const resign = useCallback(() => call(socketRef.current, 'resign'), [])
  const rematch = useCallback((cancel = false) => call(socketRef.current, 'rematch', { cancel }), [])
  const leave = useCallback(async () => {
    await call(socketRef.current, 'leave_room')
    session.clear()
    setRoom(null)
  }, [])

  return { conn, room, lan, notice, setNotice, createRoom, joinRoom, sendMove, resign, rematch, leave }
}
