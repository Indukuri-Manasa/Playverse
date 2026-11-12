import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../../components/ui/Button'
import Icon from '../../../components/ui/Icon'
import { useLocalStorage } from '../../../hooks/useLocalStorage'
import ChessBoard from '../components/ChessBoard'
import ChessControls from '../components/ChessControls'
import ChessTimer from '../components/ChessTimer'
import GameResult from '../components/GameResult'
import MoveHistory from '../components/MoveHistory'
import PlayerBar from '../components/PlayerBar'
import GameStatus from '../components/GameStatus'
import { FriendArt } from '../art/ChessArt'
import { useChessGame } from '../hooks/useChessGame'
import { useChessClock } from '../hooks/useChessClock'
import { useChessStats } from '../hooks/useChessStats'
import { hasMatingMaterial, opposite } from '../services/chessService'
import { REASON_LABEL, TIME_CONTROLS, getTimeControl } from '../services/chessStatsService'

const DEFAULT_SETUP = { white: 'Player 1', black: 'Player 2', time: 'unlimited', rotate: false }
const RESULT_CODE = { w: 'white', b: 'black' }

export default function LocalChess() {
  const [setup, setSetup] = useLocalStorage('playverse:chess-local-setup', DEFAULT_SETUP)
  const [match, setMatch] = useState(null)

  const start = () =>
    setMatch({
      id: Date.now(),
      names: { w: setup.white.trim() || 'Player 1', b: setup.black.trim() || 'Player 2' },
      time: setup.time,
      rotate: setup.rotate,
    })

  if (!match) return <LocalSetup setup={{ ...DEFAULT_SETUP, ...setup }} onChange={setSetup} onStart={start} />

  return (
    <LocalMatch
      key={match.id}
      match={match}
      // Rematch: players swap colours. Restart: same colours, fresh board and clocks.
      onRematch={() => setMatch((m) => ({ ...m, id: Date.now(), names: { w: m.names.b, b: m.names.w } }))}
      onRestart={() => setMatch((m) => ({ ...m, id: Date.now() }))}
      onNewSetup={() => setMatch(null)}
    />
  )
}

function LocalSetup({ setup, onChange, onStart }) {
  const uid = `s${useId().replace(/:/g, '')}`
  const set = (patch) => onChange((s) => ({ ...DEFAULT_SETUP, ...s, ...patch }))
  return (
    <div className="container page chess-page">
      <div className="game-topbar">
        <Button to="/play/chess" variant="ghost" size="sm"><Icon name="arrowLeft" size={16} /> Chess Battle</Button>
      </div>
      <section className="setup-card" style={{ '--accent': '#b26bff', '--accent-2': '#ff4fb8' }}>
        <div className="setup-art">
          <svg viewBox="0 0 360 200" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><FriendArt uid={uid} /></svg>
        </div>
        <form className="setup-form" onSubmit={(e) => { e.preventDefault(); onStart() }}>
          <div>
            <span className="eyebrow"><Icon name="users" size={14} /> Local · same device</span>
            <h1>Friend vs Friend</h1>
            <p className="muted">Two players share this screen. White moves first; pass the device after each move.</p>
          </div>

          <div className="setup-names">
            <label className="name-field">
              <span><i className="player-swatch swatch-w" /> White</span>
              <input value={setup.white} maxLength={20} onChange={(e) => set({ white: e.target.value })} aria-label="White player name" />
            </label>
            <button type="button" className="icon-btn swap-btn" onClick={() => set({ white: setup.black, black: setup.white })} aria-label="Swap colours" title="Swap colours">
              <Icon name="shuffle" size={16} />
            </button>
            <label className="name-field">
              <span><i className="player-swatch swatch-b" /> Black</span>
              <input value={setup.black} maxLength={20} onChange={(e) => set({ black: e.target.value })} aria-label="Black player name" />
            </label>
          </div>

          <fieldset className="setup-group">
            <legend>Time control</legend>
            <div className="option-grid">
              {TIME_CONTROLS.map((t) => (
                <label key={t.id} className={`option-card ${setup.time === t.id ? 'active' : ''}`}>
                  <input type="radio" name="time" value={t.id} checked={setup.time === t.id} onChange={() => set({ time: t.id })} />
                  <strong>{t.label}</strong>
                  <small>{t.detail}</small>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="setup-group">
            <legend>Board orientation</legend>
            <div className="option-grid two">
              {[[false, 'Fixed', 'White at the bottom'], [true, 'Rotate each turn', 'Board faces the player to move']].map(([val, label, sub]) => (
                <label key={label} className={`option-card ${setup.rotate === val ? 'active' : ''}`}>
                  <input type="radio" name="rotate" checked={setup.rotate === val} onChange={() => set({ rotate: val })} />
                  <strong>{label}</strong>
                  <small>{sub}</small>
                </label>
              ))}
            </div>
          </fieldset>

          <Button type="submit" size="lg" className="setup-start"><Icon name="play" size={16} /> Start match</Button>
        </form>
      </section>
    </div>
  )
}

function LocalMatch({ match, onRematch, onRestart, onNewSetup }) {
  const navigate = useNavigate()
  const tc = getTimeControl(match.time)
  const { names } = match
  const { recordMatch } = useChessStats()
  const [manual, setManual] = useState(null) // resignation / timeout: { winner, reason }
  const [flipped, setFlipped] = useState(false)
  const [showResult, setShowResult] = useState(true)

  const clockRef = useRef(null)
  const game = useChessGame({ onMove: (m) => clockRef.current?.runFor(opposite(m.color)) })
  const boardRef = useRef(game.board)
  boardRef.current = game.board

  const onFlag = useCallback((color) => {
    const other = opposite(color)
    setManual((cur) => cur ?? (hasMatingMaterial(boardRef.current, other) ? { winner: other, reason: 'timeout' } : { winner: null, reason: 'timeout-insufficient' }))
  }, [])
  const clock = useChessClock(tc.ms, onFlag)
  clockRef.current = clock

  const ruleOutcome = game.status.over ? { winner: game.status.winner, reason: game.status.reason } : null
  const outcome = manual ?? ruleOutcome
  const plies = game.history.length

  // Finish: stop clocks and save the result exactly once.
  const saved = useRef(false)
  const { pause } = clock
  useEffect(() => {
    if (!outcome || saved.current) return
    saved.current = true
    pause()
    recordMatch({
      id: `local-${match.id}`,
      mode: 'local',
      at: Date.now(),
      result: outcome.winner ? RESULT_CODE[outcome.winner] : 'draw',
      reason: outcome.reason,
      moves: Math.ceil(plies / 2),
      pgn: game.pgn,
      players: names,
      timeControl: match.time,
    })
  }, [outcome, pause, recordMatch, match.id, match.time, names, plies, game.pgn])

  function undo() {
    const last = game.history.at(-1)
    if (!last || outcome) return
    game.undo()
    if (plies - 1 > 0) clock.runFor(last.color)
    else clock.pause() // back to the start: clocks wait for White's first move
  }

  const base = match.rotate && !outcome ? game.turn : 'w'
  const orientation = flipped ? opposite(base) : base
  const top = opposite(orientation)

  const status = outcome
    ? {
        over: true,
        turn: game.turn,
        winner: outcome.winner,
        label: outcome.winner ? `${names[outcome.winner]} wins — ${REASON_LABEL[outcome.reason]}` : `Draw — ${REASON_LABEL[outcome.reason]}`,
      }
    : { ...game.status, label: `${names[game.turn]} to move${game.status.inCheck ? ' — check!' : ''}` }

  const bar = (color) => (
    <PlayerBar
      color={color}
      name={names[color]}
      material={game.material}
      active={!outcome && game.turn === color}
      extra={clock.enabled && <ChessTimer ms={clock.times[color]} running={clock.running === color} initialMs={tc.ms} />}
    />
  )

  return (
    <div className="container page chess-page">
      <div className="game-topbar">
        <Button to="/play/chess" variant="ghost" size="sm"><Icon name="arrowLeft" size={16} /> Chess Battle</Button>
        <span className="chip"><Icon name="users" size={13} /> Friend vs Friend · {tc.label}{tc.ms ? ` ${tc.detail}` : ''}</span>
      </div>

      <div className="chess-layout">
        <section className="board-column">
          {bar(top)}
          <ChessBoard
            board={game.board}
            orientation={orientation}
            selected={game.selected}
            legalTargets={game.legalTargets}
            lastMove={game.lastMove}
            checkSquare={game.checkSquare}
            canMovePiece={(sq) => !outcome && game.canMovePiece(sq)}
            onSelect={game.select}
            onMove={game.tryMove}
            pendingPromotion={game.pendingPromotion}
            onPromote={game.promote}
            onCancelPromotion={game.cancelPromotion}
            disabled={Boolean(outcome)}
          />
          {bar(orientation)}
        </section>

        <aside className="chess-side">
          <div className="panel side-block">
            <GameStatus status={status} />
            <ChessControls
              onUndo={undo}
              canUndo={plies > 0 && !outcome}
              onFlip={() => setFlipped((f) => !f)}
              onRestart={onRestart}
              confirmRestart={plies > 0 && !outcome}
              onResign={outcome ? null : () => setManual({ winner: opposite(game.turn), reason: 'resignation' })}
              resignLabel={`Resign (${names[game.turn]})`}
            />
            {outcome && (
              <div className="post-game">
                <Button onClick={onRematch}><Icon name="refresh" size={15} /> Rematch</Button>
                {!showResult && <Button variant="secondary" onClick={() => setShowResult(true)}>Show result</Button>}
                <Button variant="ghost" onClick={onNewSetup}>New setup</Button>
              </div>
            )}
          </div>

          <div className="panel side-block">
            <span className="eyebrow"><Icon name="history" size={14} /> Moves</span>
            <MoveHistory history={game.history} />
          </div>

          <div className="panel side-block match-info">
            <div><small>White</small><strong>{names.w}</strong></div>
            <div><small>Black</small><strong>{names.b}</strong></div>
            <div><small>Clock</small><strong>{tc.ms ? `${tc.label} · ${tc.detail}` : 'Unlimited'}</strong></div>
            <Button variant="ghost" size="sm" onClick={onNewSetup}><Icon name="edit" size={14} /> Change setup</Button>
          </div>
        </aside>
      </div>

      {outcome && showResult && (
        <GameResult
          outcome={outcome}
          names={names}
          moves={Math.ceil(plies / 2)}
          onRematch={onRematch}
          rematchLabel="Rematch (swap colours)"
          onReview={() => setShowResult(false)}
          onExit={() => navigate('/play/chess')}
        />
      )}
    </div>
  )
}
