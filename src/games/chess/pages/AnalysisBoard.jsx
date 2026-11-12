import { useState } from 'react'
import Button from '../../../components/ui/Button'
import Icon from '../../../components/ui/Icon'
import ChessBoard from '../components/ChessBoard'
import MoveHistory from '../components/MoveHistory'
import PlayerBar from '../components/PlayerBar'
import GameStatus from '../components/GameStatus'
import { useChessGame } from '../hooks/useChessGame'
import { START_FEN } from '../services/chessService'

// Practice positions that exercise every special rule.
const PRESETS = [
  { label: 'Starting position', fen: START_FEN },
  { label: 'Castling — both sides ready', fen: 'r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQkq - 0 1' },
  { label: 'En passant — play exf6', fen: 'rnbqkbnr/ppp1p1pp/8/3pPp2/8/8/PPPP1PPP/RNBQKBNR w KQkq f6 0 3' },
  { label: 'Promotion — push a7-a8', fen: '4k3/P7/8/8/8/8/7p/4K3 w - - 0 1' },
  { label: 'Mate in one — back rank', fen: '6k1/5ppp/8/8/8/8/8/R5K1 w - - 0 1' },
  { label: 'Stalemate', fen: '7k/5Q2/6K1/8/8/8/8/8 b - - 0 1' },
  { label: 'Insufficient material', fen: '8/8/4k3/8/8/3KB3/8/8 w - - 0 1' },
  { label: 'Fifty-move rule — any quiet move draws', fen: '8/8/4k3/8/8/3K4/8/7R w - - 99 80' },
]

async function copy(text) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

export default function AnalysisBoard() {
  const game = useChessGame()
  const [orientation, setOrientation] = useState('w')
  const [opts, setOpts] = useState({ legal: true, last: true, coords: true })
  const [fenInput, setFenInput] = useState('')
  const [fenError, setFenError] = useState('')
  const [copied, setCopied] = useState('')

  const top = orientation === 'w' ? 'b' : 'w'
  const bottom = orientation

  function loadPosition(fen) {
    const res = game.loadFen(fen)
    setFenError(res.ok ? '' : res.error)
    if (res.ok) setFenInput('')
  }

  async function doCopy(kind, text) {
    setCopied((await copy(text)) ? kind : 'failed')
    setTimeout(() => setCopied(''), 1500)
  }

  return (
    <div className="container page chess-page">
      <div className="game-topbar">
        <Button to="/play/chess" variant="ghost" size="sm"><Icon name="arrowLeft" size={16} /> Chess Battle</Button>
        <span className="chip"><Icon name="chess" size={13} /> Analysis Board · move either side</span>
      </div>

      <div className="chess-layout">
        <section className="board-column">
          <PlayerBar color={top} material={game.material} active={game.turn === top && !game.status.over} />
          <ChessBoard
            board={game.board}
            orientation={orientation}
            selected={game.selected}
            legalTargets={game.legalTargets}
            lastMove={game.lastMove}
            checkSquare={game.checkSquare}
            canMovePiece={game.canMovePiece}
            onSelect={game.select}
            onMove={game.tryMove}
            pendingPromotion={game.pendingPromotion}
            onPromote={game.promote}
            onCancelPromotion={game.cancelPromotion}
            showLegal={opts.legal}
            showLastMove={opts.last}
            showCoords={opts.coords}
          />
          <PlayerBar color={bottom} material={game.material} active={game.turn === bottom && !game.status.over} />
        </section>

        <aside className="chess-side">
          <div className="panel side-block">
            <GameStatus status={game.status} />
            <div className="control-row">
              <Button variant="secondary" size="sm" onClick={() => setOrientation((o) => (o === 'w' ? 'b' : 'w'))}>
                <Icon name="refresh" size={15} /> Flip board
              </Button>
              <Button variant="secondary" size="sm" onClick={() => game.undo()} disabled={game.history.length === 0}>
                <Icon name="arrowLeft" size={15} /> Undo
              </Button>
              <Button variant="ghost" size="sm" onClick={() => game.reset()}>
                Reset
              </Button>
            </div>
          </div>

          <div className="panel side-block">
            <span className="eyebrow"><Icon name="history" size={14} /> Moves</span>
            <MoveHistory history={game.history} />
          </div>

          <div className="panel side-block">
            <span className="eyebrow"><Icon name="target" size={14} /> Display</span>
            <div className="toggles">
              {[['legal', 'Legal move dots'], ['last', 'Last move highlight'], ['coords', 'Coordinates']].map(([k, label]) => (
                <label key={k} className="toggle">
                  <input type="checkbox" checked={opts[k]} onChange={(e) => setOpts((o) => ({ ...o, [k]: e.target.checked }))} />
                  <span className="toggle-track" aria-hidden="true" />
                  {label}
                </label>
              ))}
            </div>
          </div>

          <div className="panel side-block">
            <span className="eyebrow"><Icon name="book" size={14} /> Positions</span>
            <label className="field select-field full">
              <span>Practice</span>
              <select value="" onChange={(e) => e.target.value && loadPosition(e.target.value)} aria-label="Load practice position">
                <option value="">Load a rule demo…</option>
                {PRESETS.map((p) => <option key={p.label} value={p.fen}>{p.label}</option>)}
              </select>
            </label>
            <form className="fen-form" onSubmit={(e) => { e.preventDefault(); if (fenInput.trim()) loadPosition(fenInput) }}>
              <input
                className="fen-input"
                value={fenInput}
                onChange={(e) => { setFenInput(e.target.value); setFenError('') }}
                placeholder="Paste a FEN to load"
                aria-label="FEN to load"
                spellCheck="false"
              />
              <Button type="submit" size="sm" disabled={!fenInput.trim()}>Load</Button>
            </form>
            {fenError && <p className="form-error">Invalid FEN: {fenError}</p>}
            <div className="code-line">
              <code title={game.fen}>{game.fen}</code>
              <button className="icon-btn" onClick={() => doCopy('fen', game.fen)} aria-label="Copy FEN">
                <Icon name={copied === 'fen' ? 'check' : 'scroll'} size={15} />
              </button>
            </div>
            <Button variant="ghost" size="sm" onClick={() => doCopy('pgn', game.pgn)} disabled={game.history.length === 0}>
              <Icon name={copied === 'pgn' ? 'check' : 'scroll'} size={15} /> {copied === 'pgn' ? 'PGN copied' : 'Copy PGN'}
            </Button>
            {copied === 'failed' && <p className="form-error">Clipboard unavailable in this browser.</p>}
          </div>
        </aside>
      </div>
    </div>
  )
}
