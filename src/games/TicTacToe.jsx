import { useEffect, useReducer, useState } from 'react'
import Button from '../components/ui/Button'
import { useActivity } from '../hooks/useActivity'

const LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
]

function getWinner(board) {
  for (const [a, b, c] of LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { player: board[a], line: [a, b, c] }
    }
  }
  return null
}

// Simple CPU: win if possible, else block, else center, else a corner, else anything.
function cpuMove(board) {
  const empty = board.flatMap((v, i) => (v ? [] : [i]))
  for (const player of ['O', 'X']) {
    for (const i of empty) {
      const trial = [...board]
      trial[i] = player
      if (getWinner(trial)) return i
    }
  }
  if (!board[4]) return 4
  const corners = [0, 2, 6, 8].filter((i) => !board[i])
  const pool = corners.length ? corners : empty
  return pool[Math.floor(Math.random() * pool.length)]
}

const emptyBoard = () => Array(9).fill(null)
const initialState = { board: emptyBoard(), xNext: true, tally: { X: 0, O: 0, draw: 0 } }

function reducer(state, action) {
  switch (action.type) {
    case 'play': {
      const { board, xNext, tally } = state
      if (board[action.index] || getWinner(board)) return state
      const next = [...board]
      next[action.index] = xNext ? 'X' : 'O'
      const win = getWinner(next)
      let nextTally = tally
      if (win) nextTally = { ...tally, [win.player]: tally[win.player] + 1 }
      else if (next.every(Boolean)) nextTally = { ...tally, draw: tally.draw + 1 }
      return { board: next, xNext: !xNext, tally: nextTally }
    }
    case 'newRound':
      return { ...state, board: emptyBoard(), xNext: true }
    case 'resetAll':
      return initialState
    default:
      return state
  }
}

export default function TicTacToe() {
  const [mode, setMode] = useState('cpu')
  const [{ board, xNext, tally }, dispatch] = useReducer(reducer, initialState)

  const win = getWinner(board)
  const isDraw = !win && board.every(Boolean)
  const over = Boolean(win) || isDraw
  const cpuTurn = mode === 'cpu' && !xNext && !over

  // Stats only: log each finished round vs the CPU (win / loss / draw). Game rules untouched.
  const { recordTicTacToe } = useActivity()
  const outcome = mode !== 'cpu' || !over ? null : win ? (win.player === 'X' ? 'win' : 'loss') : 'draw'
  useEffect(() => {
    if (outcome) recordTicTacToe(outcome)
  }, [outcome, recordTicTacToe])

  useEffect(() => {
    if (!cpuTurn) return
    const id = setTimeout(() => dispatch({ type: 'play', index: cpuMove(board) }), 450)
    return () => clearTimeout(id)
  }, [cpuTurn, board])

  const oName = mode === 'cpu' ? 'CPU' : 'O'
  let status
  if (win) status = win.player === 'X' ? (mode === 'cpu' ? 'You win!' : 'X wins!') : `${oName} wins!`
  else if (isDraw) status = "It's a draw."
  else if (cpuTurn) status = 'CPU is thinking…'
  else status = `${xNext ? 'X' : 'O'} to move`

  function changeMode(next) {
    setMode(next)
    dispatch({ type: 'resetAll' })
  }

  return (
    <div className="ttt">
      <div className="segmented" role="group" aria-label="Opponent">
        <button className={mode === 'cpu' ? 'active' : ''} onClick={() => changeMode('cpu')}>
          vs CPU
        </button>
        <button className={mode === 'friend' ? 'active' : ''} onClick={() => changeMode('friend')}>
          vs Friend
        </button>
      </div>

      <p
        className={`status ${win ? (mode === 'cpu' && win.player === 'O' ? 'status-lose' : 'status-win') : isDraw ? 'status-draw' : ''}`}
        aria-live="polite"
      >
        {status}
      </p>

      <div className="ttt-board">
        {board.map((cell, i) => (
          <button
            key={i}
            className={`ttt-cell ${cell ? `mark-${cell}` : ''} ${win?.line.includes(i) ? 'win' : ''}`}
            onClick={() => dispatch({ type: 'play', index: i })}
            disabled={Boolean(cell) || over || cpuTurn}
            aria-label={`Cell ${i + 1}${cell ? `, ${cell}` : ''}`}
          >
            {cell}
          </button>
        ))}
      </div>

      <div className="scoreline">
        <span>{mode === 'cpu' ? 'You' : 'X'}: <strong>{tally.X}</strong></span>
        <span>Draws: <strong>{tally.draw}</strong></span>
        <span>{oName}: <strong>{tally.O}</strong></span>
      </div>

      <div className="actions">
        <Button onClick={() => dispatch({ type: 'newRound' })}>New round</Button>
        <Button variant="ghost" onClick={() => dispatch({ type: 'resetAll' })}>Reset tally</Button>
      </div>
    </div>
  )
}
