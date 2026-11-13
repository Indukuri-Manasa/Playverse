import { useEffect, useId, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Button from '../../../components/ui/Button'
import Icon from '../../../components/ui/Icon'
import { useActivity } from '../../../hooks/useActivity'
import { useLocalStorage } from '../../../hooks/useLocalStorage'
import ChessBoard from '../components/ChessBoard'
import ChessTimer from '../components/ChessTimer'
import GameResult from '../components/GameResult'
import MoveHistory from '../components/MoveHistory'
import PlayerBar from '../components/PlayerBar'
import GameStatus from '../components/GameStatus'
import { OnlineArt } from '../art/ChessArt'
import { useChessGame } from '../hooks/useChessGame'
import { useChessStats } from '../hooks/useChessStats'
import { useOnlineRoom } from '../hooks/useOnlineRoom'
import { errorText } from '../services/chessSocket'
import { COLOR_NAME, opposite } from '../services/chessService'
import { REASON_LABEL, TIME_CONTROLS, getTimeControl } from '../services/chessStatsService'

const ACCENT = { '--accent': '#ff4fb8', '--accent-2': '#ff9f43' }

export default function OnlineChess() {
  const online = useOnlineRoom()
  const { room } = online
  return (
    <div className="container page chess-page" style={ACCENT}>
      <div className="game-topbar">
        <Button to="/play/chess" variant="ghost" size="sm"><Icon name="arrowLeft" size={16} /> Chess Battle</Button>
        <ConnectionBadge conn={online.conn} />
      </div>
      {online.notice && (
        <div className="notice" role="status">
          <Icon name="globe" size={16} /> {online.notice}
          <button className="link-btn" onClick={() => online.setNotice(null)}>Dismiss</button>
        </div>
      )}
      {!room && <Lobby online={online} />}
      {room?.status === 'waiting' && <WaitingRoom online={online} />}
      {room && room.status !== 'waiting' && <OnlineMatch key={room.matchId} online={online} />}
    </div>
  )
}

function ConnectionBadge({ conn }) {
  const map = {
    online: ['ok', 'Connected'],
    connecting: ['', 'Connecting…'],
    reconnecting: ['warn', 'Reconnecting…'],
    offline: ['bad', 'Server offline'],
  }
  const [tone, label] = map[conn]
  return <span className={`conn-badge ${tone}`}><i /> {label}</span>
}

/* ---------------- Lobby: create or join ---------------- */
function Lobby({ online }) {
  const uid = `o${useId().replace(/:/g, '')}`
  const [params] = useSearchParams()
  const invite = (params.get('join') ?? '').toUpperCase().slice(0, 6)
  const { activity } = useActivity()
  const [prefs, setPrefs] = useLocalStorage('playverse:chess-online-setup', { name: '', time: 'blitz', color: 'random' })
  const name = prefs.name || activity.playerName
  const [tab, setTab] = useState(invite ? 'join' : 'create')
  const [code, setCode] = useState(invite)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const offline = online.conn !== 'online'

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    const res = tab === 'create'
      ? await online.createRoom({ name, timeControl: prefs.time, colorPref: prefs.color })
      : await online.joinRoom(code, name)
    setBusy(false)
    if (!res.ok) setError(errorText(res.error))
  }

  return (
    <section className="setup-card">
      <div className="setup-art">
        <svg viewBox="0 0 360 200" preserveAspectRatio="xMidYMid meet" aria-hidden="true"><OnlineArt uid={uid} /></svg>
      </div>
      <form className="setup-form" onSubmit={submit}>
        <div>
          <span className="eyebrow"><Icon name="globe" size={14} /> Real-time · room codes</span>
          <h1>Online Match</h1>
          <p className="muted">Create a room and share its code, or join a friend’s room. Moves sync instantly and are checked by the server.</p>
        </div>

        {online.conn === 'offline' && (
          <div className="server-help">
            <strong>Can’t reach the game server.</strong>
            <span>Start PlayVerse with <code>npm run dev:online</code> (or <code>npm run server</code> next to <code>npm run dev</code>).</span>
          </div>
        )}

        <div className="segmented wide" role="tablist" aria-label="Create or join">
          <button type="button" role="tab" aria-selected={tab === 'create'} className={tab === 'create' ? 'active' : ''} onClick={() => { setTab('create'); setError('') }}>
            <Icon name="sparkle" size={15} /> Create room
          </button>
          <button type="button" role="tab" aria-selected={tab === 'join'} className={tab === 'join' ? 'active' : ''} onClick={() => { setTab('join'); setError('') }}>
            <Icon name="users" size={15} /> Join room
          </button>
        </div>

        <label className="name-field">
          <span>Your name</span>
          <input value={name} maxLength={20} onChange={(e) => setPrefs((p) => ({ ...p, name: e.target.value }))} aria-label="Your name" />
        </label>

        {tab === 'create' ? (
          <>
            <fieldset className="setup-group">
              <legend>Time control</legend>
              <div className="option-grid">
                {TIME_CONTROLS.map((t) => (
                  <label key={t.id} className={`option-card ${prefs.time === t.id ? 'active' : ''}`}>
                    <input type="radio" name="time" checked={prefs.time === t.id} onChange={() => setPrefs((p) => ({ ...p, time: t.id }))} />
                    <strong>{t.label}</strong>
                    <small>{t.detail}</small>
                  </label>
                ))}
              </div>
            </fieldset>
            <fieldset className="setup-group">
              <legend>Your colour</legend>
              <div className="option-grid three">
                {[['w', 'White'], ['b', 'Black'], ['random', 'Random']].map(([val, label]) => (
                  <label key={val} className={`option-card ${prefs.color === val ? 'active' : ''}`}>
                    <input type="radio" name="color" checked={prefs.color === val} onChange={() => setPrefs((p) => ({ ...p, color: val }))} />
                    <strong>{label}</strong>
                  </label>
                ))}
              </div>
            </fieldset>
          </>
        ) : (
          <label className="name-field">
            <span>Room code</span>
            <input
              className="code-input"
              value={code}
              onChange={(e) => { setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6)); setError('') }}
              placeholder="ABC123"
              inputMode="text"
              autoCapitalize="characters"
              autoComplete="off"
              spellCheck="false"
              aria-label="Room code"
            />
          </label>
        )}

        {error && <p className="form-error" role="alert">{error}</p>}

        <Button type="submit" size="lg" className="setup-start" disabled={busy || offline || (tab === 'join' && code.length !== 6)}>
          {busy ? <><span className="spinner sm" /> Please wait…</> : tab === 'create' ? <><Icon name="sparkle" size={16} /> Create room</> : <><Icon name="play" size={16} /> Join room</>}
        </Button>
      </form>
    </section>
  )
}

/* ---------------- Waiting room ---------------- */
function inviteLink(code, lan) {
  const { protocol, hostname, port } = window.location
  const local = hostname === 'localhost' || hostname === '127.0.0.1'
  const host = local && lan[0] ? lan[0] : hostname
  return `${protocol}//${host}${port ? `:${port}` : ''}/play/chess/online?join=${code}`
}

function WaitingRoom({ online }) {
  const { room, lan } = online
  const [copied, setCopied] = useState('')
  const link = inviteLink(room.code, lan)
  const tc = getTimeControl(room.timeControl)
  const local = ['localhost', '127.0.0.1'].includes(window.location.hostname)

  async function copy(kind, text) {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(kind)
    } catch {
      setCopied('failed')
    }
    setTimeout(() => setCopied(''), 1600)
  }
  async function share() {
    const text = `Play chess with me on PlayVerse! Room code: ${room.code}`
    if (navigator.share) {
      try {
        await navigator.share({ title: 'PlayVerse Chess Battle', text, url: link })
        return
      } catch { /* cancelled → fall back to copying */ }
    }
    copy('link', `${text}\n${link}`)
  }

  return (
    <section className="waiting">
      <div className="panel waiting-card">
        <span className="eyebrow"><Icon name="globe" size={14} /> Room created</span>
        <h1>Share this code</h1>
        <div className="room-code" aria-label={`Room code ${room.code.split('').join(' ')}`}>
          {room.code.split('').map((ch, i) => <span key={i}>{ch}</span>)}
        </div>
        <div className="waiting-actions">
          <Button onClick={() => copy('code', room.code)}><Icon name={copied === 'code' ? 'check' : 'scroll'} size={16} /> {copied === 'code' ? 'Code copied' : 'Copy code'}</Button>
          <Button variant="secondary" onClick={share}><Icon name={copied === 'link' ? 'check' : 'users'} size={16} /> {copied === 'link' ? 'Invite copied' : 'Share invitation'}</Button>
        </div>
        {copied === 'failed' && <p className="form-error">Couldn’t access the clipboard — copy the code by hand.</p>}
        <div className="invite-link"><code>{link}</code></div>
        <div className="waiting-pulse" role="status"><span className="pulse-ring" /> Waiting for opponent…</div>
        <dl className="waiting-meta">
          <div><dt>You play</dt><dd>{COLOR_NAME[room.you]}</dd></div>
          <div><dt>Clock</dt><dd>{tc.label}{tc.ms ? ` · ${tc.detail}` : ''}</dd></div>
          <div><dt>Players</dt><dd>1 / 2</dd></div>
        </dl>
        {local && (
          <p className="lan-tip">
            <Icon name="globe" size={14} /> Friends on the same Wi-Fi can open the invite link above
            {lan[0] ? <> (your Mac is <code>{lan[0]}</code>)</> : null}. This needs PlayVerse started with <code>npm run dev:online</code>.
          </p>
        )}
        <Button variant="ghost" onClick={online.leave}><Icon name="close" size={15} /> Cancel room</Button>
      </div>
    </section>
  )
}

/* ---------------- Match ---------------- */
function useNow(active) {
  const [now, setNow] = useState(() => performance.now())
  useEffect(() => {
    if (!active) return
    const id = setInterval(() => setNow(performance.now()), 100)
    return () => clearInterval(id)
  }, [active])
  return now
}

function OnlineMatch({ online }) {
  const navigate = useNavigate()
  const { room, sendMove } = online
  const you = room.you
  const opp = opposite(you)
  const tc = getTimeControl(room.timeControl)
  const serverMoves = room.game?.moves ?? []
  const result = room.game?.result ?? null
  const finished = room.status === 'finished'
  const { recordMatch } = useChessStats()

  const [flipped, setFlipped] = useState(false)
  const [showResult, setShowResult] = useState(true)
  const [confirmLeave, setConfirmLeave] = useState(false)
  const [resync, setResync] = useState(0)

  // Local board mirrors the server. Our own moves are shown immediately (optimistic) and sent
  // with the ply they were made at; if the server rejects one, we snap back to its position.
  const serverPlyRef = useRef(serverMoves.length)
  serverPlyRef.current = serverMoves.length
  const game = useChessGame({
    controls: you,
    onMove: async (m) => {
      const res = await sendMove({ from: m.from, to: m.to, promotion: m.promotion, ply: serverPlyRef.current })
      if (!res.ok) setResync((n) => n + 1)
    },
  })
  const historyRef = useRef(game.history)
  historyRef.current = game.history
  const { loadMoves } = game
  const serverKey = serverMoves.join(' ')
  useEffect(() => {
    const local = historyRef.current.map((m) => m.lan).join(' ')
    if (local !== serverKey) loadMoves(serverKey ? serverKey.split(' ') : [])
  }, [serverKey, resync, loadMoves])

  // Clocks: server snapshot + time since it arrived.
  const clock = room.game?.clock
  const oppSeat = room.players[opp]
  const oppAway = oppSeat && !oppSeat.connected && !oppSeat.left
  // One ticker drives both the clocks and the reconnect countdown.
  const now = useNow(!finished && (Boolean(clock?.running) || Boolean(oppAway)))
  // `now` ticks every 100ms, so a fresh snapshot can be newer than it: never count negative time.
  const sinceSnapshot = Math.max(0, now - room.receivedAt)
  const timeLeft = (c) => (clock ? Math.max(0, clock[c] - (clock.running === c && !finished ? sinceSnapshot : 0)) : null)

  // Opponent reconnect countdown.
  const graceLeft = oppAway && oppSeat.disconnectedAt
    ? Math.max(0, room.reconnectGraceMs - (room.serverTime - oppSeat.disconnectedAt) - sinceSnapshot)
    : null
  const names = { w: room.players.w?.name ?? 'White', b: room.players.b?.name ?? 'Black' }

  // Save each finished match once (keyed by the server's match id).
  useEffect(() => {
    if (!finished || !result || !room.matchId) return
    recordMatch({
      id: `online-${room.matchId}`,
      serverMatchId: room.matchId,
      mode: 'online',
      at: Date.now(),
      result: result.winner ? (result.winner === you ? 'win' : 'loss') : 'draw',
      reason: result.reason,
      moves: Math.ceil(serverMoves.length / 2),
      playerColor: you,
      opponent: names[opp],
      roomCode: room.code,
      timeControl: room.timeControl,
    })
  }, [finished, result, room.matchId]) // eslint-disable-line react-hooks/exhaustive-deps -- record once per match id

  const status = finished && result
    ? {
        over: true, turn: game.turn, winner: result.winner,
        label: result.winner ? `${result.winner === you ? 'You win' : `${names[opp]} wins`} — ${REASON_LABEL[result.reason]}` : `Draw — ${REASON_LABEL[result.reason]}`,
      }
    : { ...game.status, label: game.turn === you ? `Your move${game.status.inCheck ? ' — check!' : ''}` : `Waiting for ${names[opp]}…` }

  const orientation = flipped ? opp : you
  const seatBadge = (c) => {
    const s = room.players[c]
    const state = !s ? 'empty' : s.left ? 'left' : s.connected ? 'on' : 'off'
    const label = { on: 'Online', off: 'Disconnected', left: 'Left', empty: '' }[state]
    return <span className={`seat-dot ${state}`} title={label}><i />{c !== you && label}</span>
  }
  const bar = (c) => (
    <PlayerBar
      color={c}
      name={c === you ? `${names[c]} (you)` : names[c]}
      material={game.material}
      active={!finished && game.turn === c}
      extra={<>{seatBadge(c)}{clock && <ChessTimer ms={timeLeft(c)} running={!finished && clock.running === c} initialMs={tc.ms} />}</>}
    />
  )

  const youAsked = room.rematch?.[you]
  const oppAsked = room.rematch?.[opp]
  const oppLeft = oppSeat?.left
  const rematchLabel = oppLeft ? 'Opponent left' : youAsked ? 'Waiting for opponent…' : oppAsked ? 'Accept rematch' : 'Request rematch'

  return (
    <>
      <div className="chess-layout">
        <section className="board-column">
          {bar(opposite(orientation))}
          <ChessBoard
            board={game.board}
            orientation={orientation}
            selected={game.selected}
            legalTargets={game.legalTargets}
            lastMove={game.lastMove}
            checkSquare={game.checkSquare}
            canMovePiece={(sq) => !finished && online.conn === 'online' && game.canMovePiece(sq)}
            onSelect={game.select}
            onMove={game.tryMove}
            pendingPromotion={game.pendingPromotion}
            onPromote={game.promote}
            onCancelPromotion={game.cancelPromotion}
            disabled={finished || online.conn !== 'online'}
          />
          {bar(orientation)}
        </section>

        <aside className="chess-side">
          <div className="panel side-block">
            <GameStatus status={status} />
            {online.conn !== 'online' && <p className="warn-text"><span className="spinner sm" /><span>Connection lost — reconnecting. Your seat is held.</span></p>}
            {oppAway && !finished && (
              <p className="warn-text">
                <Icon name="globe" size={14} />
                <span>
                  {names[opp]} disconnected.
                  {graceLeft != null && <> If they don’t return in <strong>{Math.ceil(graceLeft / 1000)}s</strong>, you win.</>}
                </span>
              </p>
            )}
            <div className="chess-controls">
              <Button variant="secondary" size="sm" onClick={() => setFlipped((f) => !f)}><Icon name="refresh" size={15} /> Flip</Button>
              {!finished && (
                <ResignButton onResign={online.resign} />
              )}
              {finished ? (
                <Button variant="ghost" size="sm" onClick={online.leave}><Icon name="arrowLeft" size={15} /> Leave room</Button>
              ) : (
                <Button variant={confirmLeave ? 'danger' : 'ghost'} size="sm" onClick={() => (confirmLeave ? online.leave() : setConfirmLeave(true))} onBlur={() => setConfirmLeave(false)}>
                  <Icon name="arrowLeft" size={15} /> {confirmLeave ? 'Leave & forfeit?' : 'Leave'}
                </Button>
              )}
            </div>
            {finished && (
              <div className="post-game">
                <Button onClick={() => online.rematch(false)} disabled={youAsked || oppLeft}><Icon name="refresh" size={15} /> {rematchLabel}</Button>
                {youAsked && <Button variant="ghost" onClick={() => online.rematch(true)}>Cancel request</Button>}
                {!showResult && <Button variant="secondary" onClick={() => setShowResult(true)}>Show result</Button>}
              </div>
            )}
          </div>

          <div className="panel side-block">
            <span className="eyebrow"><Icon name="history" size={14} /> Moves</span>
            <MoveHistory history={game.history} />
          </div>

          <div className="panel side-block match-info">
            <div><small>Room</small><strong className="mono">{room.code}</strong></div>
            <div><small>Clock</small><strong>{tc.ms ? `${tc.label} · ${tc.detail}` : 'Unlimited'}</strong></div>
            <div><small>You play</small><strong>{COLOR_NAME[you]}</strong></div>
            <div><small>Server</small><strong>{online.conn === 'online' ? 'Connected' : 'Reconnecting…'}</strong></div>
          </div>
        </aside>
      </div>

      {finished && result && showResult && (
        <GameResult
          outcome={result}
          names={names}
          perspective={you}
          moves={Math.ceil(serverMoves.length / 2)}
          onRematch={oppLeft ? null : () => online.rematch(false)}
          rematchLabel={rematchLabel}
          rematchDisabled={youAsked}
          onReview={() => setShowResult(false)}
          onExit={async () => { await online.leave(); navigate('/play/chess') }}
          exitLabel="Leave room"
        >
          {oppAsked && !youAsked && <p className="result-note"><Icon name="sparkle" size={14} /> {names[opp]} wants a rematch!</p>}
          {oppLeft && <p className="result-note">{names[opp]} has left the room.</p>}
        </GameResult>
      )}
    </>
  )
}

function ResignButton({ onResign }) {
  const [armed, setArmed] = useState(false)
  useEffect(() => {
    if (!armed) return
    const id = setTimeout(() => setArmed(false), 3000)
    return () => clearTimeout(id)
  }, [armed])
  return (
    <Button variant="danger" size="sm" onClick={() => (armed ? (setArmed(false), onResign()) : setArmed(true))}>
      <Icon name="close" size={15} /> {armed ? 'Tap again to resign' : 'Resign'}
    </Button>
  )
}
