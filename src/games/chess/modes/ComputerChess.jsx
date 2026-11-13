import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../../components/ui/Button'
import Icon from '../../../components/ui/Icon'
import { useLocalStorage } from '../../../hooks/useLocalStorage'
import ChessBoard from '../components/ChessBoard'
import ChessControls from '../components/ChessControls'
import GameResult from '../components/GameResult'
import MoveHistory from '../components/MoveHistory'
import PlayerBar from '../components/PlayerBar'
import GameStatus from '../components/GameStatus'
import { ComputerArt } from '../art/ChessArt'
import { useChessGame } from '../hooks/useChessGame'
import { useChessStats } from '../hooks/useChessStats'
import { useStockfish } from '../hooks/useStockfish'
import { ENGINE_LEVELS, HINT_LEVEL } from '../services/engineLevels'
import { COLOR_NAME, opposite } from '../services/chessService'
import { REASON_LABEL } from '../services/chessStatsService'

const DEFAULT_SETUP = { color: 'w', level: 'medium', hints: true }
const MIN_THINK_MS = 450 // keeps instant engine replies from feeling robotic

export default function ComputerChess() {
  const [setup, setSetup] = useLocalStorage('playverse:chess-computer-setup', DEFAULT_SETUP)
  const [match, setMatch] = useState(null)
  const engine = useStockfish() // loaded once, shared by every game on this screen

  function start(overrides = {}) {
    const s = { ...DEFAULT_SETUP, ...setup, ...overrides }
    const color = s.color === 'random' ? (Math.random() < 0.5 ? 'w' : 'b') : s.color
    engine.newGame()
    setMatch({ id: Date.now(), player: color, level: s.level, hints: s.hints })
  }

  if (!match) return <ComputerSetup setup={{ ...DEFAULT_SETUP, ...setup }} onChange={setSetup} onStart={() => start()} engine={engine} />

  return (
    <ComputerMatch
      key={match.id}
      match={match}
      engine={engine}
      onNewGame={() => { engine.newGame(); setMatch((m) => ({ ...m, id: Date.now() })) }}
      onRematch={() => { engine.newGame(); setMatch((m) => ({ ...m, id: Date.now(), player: opposite(m.player) })) }}
      onNewSetup={() => setMatch(null)}
    />
  )
}

function EngineBadge({ engine }) {
  if (engine.status === 'ready') return <span className="engine-badge ok"><i /> Stockfish 17.1 ready</span>
  if (engine.status === 'loading') return <span className="engine-badge"><span className="spinner sm" /> Loading engine…</span>
  return (
    <span className="engine-badge bad">
      <Icon name="close" size={13} /> {engine.status === 'unsupported' ? 'This browser can’t run the engine' : engine.error}
      {engine.status === 'error' && <button type="button" onClick={engine.retry}>Retry</button>}
    </span>
  )
}

function ComputerSetup({ setup, onChange, onStart, engine }) {
  const uid = `c${useId().replace(/:/g, '')}`
  const set = (patch) => onChange((s) => ({ ...DEFAULT_SETUP, ...s, ...patch }))
  return (
    <div className="container page chess-page">
      <div className="game-topbar">
        <Button to="/play/chess" variant="ghost" size="sm"><Icon name="arrowLeft" size={16} /> Chess Battle</Button>
      </div>
      <section className="setup-card" style={{ '--accent': '#2ee6ff', '--accent-2': '#4d7cff', '--on-accent': '#031321' }}>
        <div className="setup-art">
          <svg viewBox="0 0 360 200" preserveAspectRatio="xMidYMid meet" aria-hidden="true"><ComputerArt uid={uid} /></svg>
        </div>
        <form className="setup-form" onSubmit={(e) => { e.preventDefault(); onStart() }}>
          <div>
            <span className="eyebrow"><Icon name="cpu" size={14} /> Stockfish engine</span>
            <h1>Computer vs You</h1>
            <p className="muted">Play a real chess engine. It thinks in the background, so the board never freezes.</p>
            <EngineBadge engine={engine} />
          </div>

          <fieldset className="setup-group">
            <legend>Difficulty</legend>
            <div className="level-list">
              {Object.entries(ENGINE_LEVELS).map(([id, lv], i) => (
                <label key={id} className={`level-card ${setup.level === id ? 'active' : ''}`}>
                  <input type="radio" name="level" checked={setup.level === id} onChange={() => set({ level: id })} />
                  <span className="level-pips" aria-hidden="true">{[0, 1, 2, 3, 4].map((n) => <i key={n} className={n <= i ? 'on' : ''} />)}</span>
                  <span className="level-text"><strong>{lv.label}</strong><small>{lv.blurb}</small></span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="setup-group">
            <legend>Play as</legend>
            <div className="option-grid three">
              {[['w', 'White', 'You move first'], ['b', 'Black', 'Engine moves first'], ['random', 'Random', 'Toss a coin']].map(([val, label, sub]) => (
                <label key={val} className={`option-card ${setup.color === val ? 'active' : ''}`}>
                  <input type="radio" name="color" checked={setup.color === val} onChange={() => set({ color: val })} />
                  <strong>{label}</strong>
                  <small>{sub}</small>
                </label>
              ))}
            </div>
          </fieldset>

          <label className="toggle">
            <input type="checkbox" checked={setup.hints} onChange={(e) => set({ hints: e.target.checked })} />
            <span className="toggle-track" aria-hidden="true" />
            Enable move hints
          </label>

          <Button type="submit" size="lg" className="setup-start" disabled={engine.status === 'unsupported'}>
            <Icon name="play" size={16} /> Start game
          </Button>
        </form>
      </section>
    </div>
  )
}

function ComputerMatch({ match, engine, onNewGame, onRematch, onNewSetup }) {
  const navigate = useNavigate()
  const { player } = match
  const level = ENGINE_LEVELS[match.level]
  const { recordMatch } = useChessStats()
  const game = useChessGame({ controls: player })
  const [resigned, setResigned] = useState(false)
  const [thinking, setThinking] = useState(false)
  const [hintsOn, setHintsOn] = useState(match.hints)
  const [hint, setHint] = useState(null) // { from, to, san }
  const [hintLoading, setHintLoading] = useState(false)
  const [hintsUsed, setHintsUsed] = useState(0)
  const [engineFault, setEngineFault] = useState(null)
  const [flipped, setFlipped] = useState(false)
  const [showResult, setShowResult] = useState(true)

  const names = { [player]: 'You', [opposite(player)]: `Stockfish · ${level.label}` }
  const { over, winner, reason } = game.status
  const outcome = useMemo(() => {
    if (resigned) return { winner: opposite(player), reason: 'resignation' }
    return over ? { winner, reason } : null
  }, [resigned, player, over, winner, reason])
  const engineTurn = !outcome && game.turn !== player
  const plies = game.history.length
  const { bestMove, cancel } = engine
  const { applyMove, history } = game
  // Whole game for the engine (see stockfishService.bestMove).
  const position = useMemo(
    () => ({ fen: game.fen, startFen: history[0]?.before ?? game.fen, moves: history.map((m) => m.lan) }),
    [game.fen, history],
  )

  // Engine's move: runs whenever it's the engine's turn in a fresh position.
  useEffect(() => {
    if (!engineTurn || engine.status !== 'ready') return
    let cancelled = false
    let timer
    setThinking(true)
    const started = performance.now()
    bestMove({ ...position, ...level })
      .then((mv) => {
        if (cancelled || !mv) return
        timer = setTimeout(() => {
          if (cancelled) return
          // chess.js validates the engine's move like any other; never trust it blindly.
          if (!applyMove(mv)) setEngineFault(`Engine suggested an illegal move (${mv.from}${mv.to})`)
          setThinking(false)
        }, Math.max(0, MIN_THINK_MS - (performance.now() - started)))
      })
      .catch((err) => !cancelled && setEngineFault(err.message))
    return () => {
      cancelled = true
      clearTimeout(timer)
      cancel()
      setThinking(false)
    }
  }, [engineTurn, engine.status, position, level, bestMove, cancel, applyMove])

  // A hint belongs to one position only.
  useEffect(() => setHint(null), [game.fen])

  async function askHint() {
    if (engineTurn || outcome || hintLoading) return
    setHintLoading(true)
    const mv = await bestMove({ ...position, ...HINT_LEVEL })
    setHintLoading(false)
    if (!mv) return
    const san = game.legal[mv.from]?.find((m) => m.to === mv.to && (!mv.promotion || m.promotion === mv.promotion))?.san
    setHint({ ...mv, san })
    setHintsUsed((n) => n + 1)
  }

  // Practice undo: take back your last move (and the engine's reply, if it has moved).
  function undo() {
    if (outcome || plies === 0) return
    // Engine thinking → take back just your move. Your turn → take back the engine's reply + your move.
    game.undo(engineTurn ? 1 : 2)
  }
  const canUndo = !outcome && (engineTurn ? plies > 0 : plies >= 2)

  // Save the finished game once.
  const saved = useRef(false)
  useEffect(() => {
    if (!outcome || saved.current) return
    saved.current = true
    recordMatch({
      id: `computer-${match.id}`,
      mode: 'computer',
      at: Date.now(),
      result: outcome.winner ? (outcome.winner === player ? 'win' : 'loss') : 'draw',
      reason: outcome.reason,
      moves: Math.ceil(plies / 2),
      pgn: game.pgn,
      playerColor: player,
      difficulty: match.level,
      opponent: `Stockfish ${level.label}`,
      hintsUsed,
    })
  }, [outcome, recordMatch, match.id, match.level, level.label, player, plies, game.pgn, hintsUsed])

  const orientation = flipped ? opposite(player) : player
  const status = outcome
    ? {
        over: true, turn: game.turn, winner: outcome.winner,
        label: outcome.winner ? `${outcome.winner === player ? 'You win' : 'Stockfish wins'} — ${REASON_LABEL[outcome.reason]}` : `Draw — ${REASON_LABEL[outcome.reason]}`,
      }
    : engine.status === 'loading'
      ? { ...game.status, label: 'Loading engine…' }
      : { ...game.status, label: engineTurn ? 'Stockfish is thinking…' : `Your move (${COLOR_NAME[player]})${game.status.inCheck ? ' — check!' : ''}` }

  return (
    <div className="container page chess-page">
      <div className="game-topbar">
        <Button to="/play/chess" variant="ghost" size="sm"><Icon name="arrowLeft" size={16} /> Chess Battle</Button>
        <span className="chip"><Icon name="cpu" size={13} /> Computer · {level.label} · you play {COLOR_NAME[player]}</span>
      </div>

      <div className="chess-layout">
        <section className="board-column">
          <PlayerBar color={opposite(orientation)} name={names[opposite(orientation)]} material={game.material}
            active={!outcome && game.turn === opposite(orientation)} thinking={thinking && opposite(orientation) !== player} />
          <ChessBoard
            board={game.board}
            orientation={orientation}
            selected={game.selected}
            legalTargets={game.legalTargets}
            lastMove={game.lastMove}
            checkSquare={game.checkSquare}
            canMovePiece={(sq) => !outcome && !engineTurn && game.canMovePiece(sq)}
            onSelect={game.select}
            onMove={game.tryMove}
            pendingPromotion={game.pendingPromotion}
            onPromote={game.promote}
            onCancelPromotion={game.cancelPromotion}
            disabled={Boolean(outcome) || engineTurn || engine.status !== 'ready'}
            hint={hintsOn ? hint : null}
          />
          <PlayerBar color={orientation} name={names[orientation]} material={game.material}
            active={!outcome && game.turn === orientation} thinking={thinking && orientation !== player} />
        </section>

        <aside className="chess-side">
          <div className="panel side-block">
            <GameStatus status={status} />
            {thinking && <div className="think-bar" aria-hidden="true"><i /></div>}
            {engineFault && (
              <p className="form-error">{engineFault} <button className="link-btn" onClick={() => { setEngineFault(null); engine.retry() }}>Restart engine</button></p>
            )}
            {engine.status === 'error' && <EngineBadge engine={engine} />}
            <ChessControls
              onUndo={undo}
              canUndo={canUndo}
              onFlip={() => setFlipped((f) => !f)}
              onRestart={onNewGame}
              confirmRestart={plies > 0 && !outcome}
              onResign={outcome ? null : () => setResigned(true)}
              resignLabel="Resign"
            />
            {outcome && (
              <div className="post-game">
                <Button onClick={onRematch}><Icon name="refresh" size={15} /> Rematch (swap colours)</Button>
                {!showResult && <Button variant="secondary" onClick={() => setShowResult(true)}>Show result</Button>}
                <Button variant="ghost" onClick={onNewSetup}>New setup</Button>
              </div>
            )}
          </div>

          <div className="panel side-block">
            <div className="hint-head">
              <span className="eyebrow"><Icon name="sparkle" size={14} /> Hints</span>
              <label className="toggle compact">
                <input type="checkbox" checked={hintsOn} onChange={(e) => { setHintsOn(e.target.checked); setHint(null) }} />
                <span className="toggle-track" aria-hidden="true" />
                <span className="sr-only">Enable move hints</span>
              </label>
            </div>
            {hintsOn ? (
              <>
                <Button variant="secondary" size="sm" onClick={askHint} disabled={engineTurn || Boolean(outcome) || hintLoading || engine.status !== 'ready'}>
                  {hintLoading ? <><span className="spinner sm" /> Thinking…</> : <><Icon name="sparkle" size={15} /> Show best move</>}
                </Button>
                {hint && <p className="hint-text">Suggested: <strong>{hint.san ?? `${hint.from}→${hint.to}`}</strong></p>}
                <small className="muted">Hints used this game: {hintsUsed}</small>
              </>
            ) : (
              <small className="muted">Hints are off.</small>
            )}
          </div>

          <div className="panel side-block">
            <span className="eyebrow"><Icon name="history" size={14} /> Moves</span>
            <MoveHistory history={game.history} />
          </div>

          <div className="panel side-block match-info">
            <div><small>You</small><strong>{COLOR_NAME[player]}</strong></div>
            <div><small>Engine</small><strong>{level.label}</strong></div>
            <Button variant="ghost" size="sm" onClick={onNewSetup}><Icon name="edit" size={14} /> Change setup</Button>
          </div>
        </aside>
      </div>

      {outcome && showResult && (
        <GameResult
          outcome={outcome}
          names={names}
          perspective={player}
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
