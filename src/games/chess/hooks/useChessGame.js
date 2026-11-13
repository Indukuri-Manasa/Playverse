import { useCallback, useRef, useState } from 'react'
import { checkFen, createGame, isPromotion, snapshot } from '../services/chessService'

/**
 * Local chess game state on top of chess.js.
 *
 * @param {object} opts
 * @param {string} [opts.fen]        starting position
 * @param {'both'|'w'|'b'|'none'} [opts.controls]  which side(s) the local user may move
 * @param {(move) => void} [opts.onMove]  called after every successful move (AI / online hooks use this)
 */
export function useChessGame({ fen, controls = 'both', onMove } = {}) {
  const chessRef = useRef(null)
  if (chessRef.current === null) chessRef.current = createGame(fen)
  const chess = chessRef.current

  const [snap, setSnap] = useState(() => snapshot(chess))
  const [selected, setSelected] = useState(null)
  const [pendingPromotion, setPendingPromotion] = useState(null) // { from, to, color }
  const onMoveRef = useRef(onMove)
  onMoveRef.current = onMove

  const refresh = useCallback(() => {
    setSnap(snapshot(chess))
    setSelected(null)
    setPendingPromotion(null)
  }, [chess])

  const canMovePiece = useCallback(
    (square) => {
      const piece = chess.get(square)
      if (!piece || piece.color !== chess.turn() || chess.isGameOver()) return false
      return controls === 'both' || controls === piece.color
    },
    [chess, controls],
  )

  /** Applies a move through chess.js. Returns the move, or null if illegal. */
  const commit = useCallback(
    (from, to, promotion) => {
      let move
      try {
        move = chess.move({ from, to, promotion })
      } catch {
        return null
      }
      refresh()
      onMoveRef.current?.(move)
      return move
    },
    [chess, refresh],
  )

  /** User attempt (click or drop). Opens the promotion picker when needed. */
  const tryMove = useCallback(
    (from, to) => {
      if (!canMovePiece(from)) return false
      const moves = snap.legal[from]
      if (!moves?.some((m) => m.to === to)) {
        // Not legal: clicking another own piece switches selection, anything else clears it.
        setSelected(canMovePiece(to) ? to : null)
        return false
      }
      if (isPromotion(moves, to)) {
        setPendingPromotion({ from, to, color: chess.turn() })
        setSelected(from)
        return 'promotion'
      }
      return Boolean(commit(from, to))
    },
    [canMovePiece, chess, commit, snap.legal],
  )

  const select = useCallback(
    (square) => {
      if (pendingPromotion) return
      setSelected(square && canMovePiece(square) ? square : null)
    },
    [canMovePiece, pendingPromotion],
  )

  const promote = useCallback(
    (piece) => {
      if (!pendingPromotion) return
      commit(pendingPromotion.from, pendingPromotion.to, piece)
    },
    [commit, pendingPromotion],
  )

  const cancelPromotion = useCallback(() => {
    setPendingPromotion(null)
    setSelected(null)
  }, [])

  /** For engine / network moves: { from, to, promotion } or SAN. */
  const applyMove = useCallback(
    (move) => {
      let result
      try {
        result = chess.move(move)
      } catch {
        return null
      }
      refresh()
      return result
    },
    [chess, refresh],
  )

  const undo = useCallback(
    (plies = 1) => {
      let undone = 0
      for (let i = 0; i < plies && chess.undo(); i++) undone++
      refresh()
      return undone
    },
    [chess, refresh],
  )

  const reset = useCallback(
    (startFen) => {
      chess.load(startFen ?? fen ?? createGame().fen())
      refresh()
    },
    [chess, fen, refresh],
  )

  const loadFen = useCallback(
    (newFen) => {
      const check = checkFen(newFen)
      if (!check.ok) return check
      chess.load(newFen.trim())
      refresh()
      return check
    },
    [chess, refresh],
  )

  /** Replace the game with `moves` (UCI strings like "e7e8q") played from `startFen`. Used to mirror the server. */
  const loadMoves = useCallback(
    (moves, startFen) => {
      chess.load(startFen ?? fen ?? createGame().fen())
      for (const m of moves) {
        try {
          chess.move({ from: m.slice(0, 2), to: m.slice(2, 4), promotion: m[4] || undefined })
        } catch {
          break
        }
      }
      refresh()
    },
    [chess, fen, refresh],
  )

  const legalTargets = selected ? snap.legal[selected] ?? [] : []

  return {
    ...snap,
    selected,
    legalTargets,
    pendingPromotion,
    canMovePiece,
    select,
    tryMove,
    promote,
    cancelPromotion,
    applyMove,
    undo,
    reset,
    loadFen,
    loadMoves,
  }
}
