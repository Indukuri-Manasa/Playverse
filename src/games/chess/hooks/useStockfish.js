import { useCallback, useEffect, useRef, useState } from 'react'
import { createEngine, engineSupported } from '../services/stockfishService'

/** Owns one Stockfish worker for the lifetime of the component. */
export function useStockfish() {
  const engineRef = useRef(null)
  const [status, setStatus] = useState(engineSupported() ? 'loading' : 'unsupported')
  const [error, setError] = useState(null)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (!engineSupported()) return
    let alive = true
    const fail = (err) => {
      if (!alive) return
      setError(err.message)
      setStatus('error')
    }
    const engine = createEngine({ onError: fail })
    engineRef.current = engine
    engine.ready.then(() => alive && setStatus('ready'), fail)
    return () => {
      alive = false
      engine.terminate()
      engineRef.current = null
    }
  }, [attempt])

  const bestMove = useCallback((opts) => engineRef.current?.bestMove(opts) ?? Promise.resolve(null), [])
  const cancel = useCallback(() => engineRef.current?.cancel(), [])
  const newGame = useCallback(() => engineRef.current?.newGame(), [])
  const retry = useCallback(() => {
    setError(null)
    setStatus('loading')
    setAttempt((a) => a + 1)
  }, [])

  return { status, error, bestMove, cancel, newGame, retry }
}
