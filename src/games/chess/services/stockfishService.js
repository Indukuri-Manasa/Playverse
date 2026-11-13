// Stockfish runs in a Web Worker (public/engine/stockfish.js + .wasm, copied from the
// `stockfish` package by scripts/copy-engine.mjs), so searching never blocks the UI thread.
// Communication is plain UCI text over postMessage.

const ENGINE_URL = `${import.meta.env.BASE_URL}engine/stockfish.js`

export function engineSupported() {
  return typeof Worker !== 'undefined' && typeof WebAssembly !== 'undefined'
}

/** UCI "e7e8q" → { from, to, promotion } */
export function parseUciMove(uci) {
  if (!uci || uci === '(none)' || uci.length < 4) return null
  return { from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: uci[4] || undefined }
}

export function createEngine({ onError } = {}) {
  const worker = new Worker(ENGINE_URL)
  const listeners = new Set()
  let dead = false

  worker.onmessage = (e) => {
    const line = typeof e.data === 'string' ? e.data : String(e.data ?? '')
    for (const l of [...listeners]) l(line)
  }
  worker.onerror = (e) => {
    dead = true
    onError?.(new Error(e.message || 'Chess engine failed to load'))
  }

  const send = (cmd) => !dead && worker.postMessage(cmd)

  function waitFor(match, timeoutMs) {
    return new Promise((resolve, reject) => {
      const onLine = (line) => {
        if (!match(line)) return
        listeners.delete(onLine)
        clearTimeout(timer)
        resolve(line)
      }
      const timer = setTimeout(() => {
        listeners.delete(onLine)
        reject(new Error('Chess engine did not respond'))
      }, timeoutMs)
      listeners.add(onLine)
    })
  }

  // UCI handshake.
  const ready = (async () => {
    send('uci')
    await waitFor((l) => l === 'uciok', 30_000)
    send('setoption name Hash value 16')
    send('isready')
    await waitFor((l) => l === 'readyok', 30_000)
  })()
  ready.catch((err) => onError?.(err))

  // Searches run one at a time; a newer request (or cancel) makes older results stale.
  let queue = Promise.resolve()
  let generation = 0

  /**
   * @param {string} fen          current position (used when no move list is given)
   * @param {string} [startFen]   position the game started from
   * @param {string[]} [moves]    moves since startFen in UCI form ("e2e4", "e7e8q").
   *   Sending the full move list (not just the current FEN) lets Stockfish see the game
   *   history, so it knows about repetitions and the fifty-move count.
   */
  function bestMove({ fen, startFen, moves, skill, depth, movetime }) {
    const gen = ++generation
    const run = async () => {
      await ready
      if (gen !== generation) return null
      send(`setoption name Skill Level value ${skill}`)
      send(moves?.length ? `position fen ${startFen} moves ${moves.join(' ')}` : `position fen ${fen}`)
      send(`go depth ${depth} movetime ${movetime}`)
      const line = await waitFor((l) => l.startsWith('bestmove'), movetime + 20_000)
      return parseUciMove(line.split(' ')[1])
    }
    const job = queue.then(run, run)
    queue = job.catch(() => {})
    return job.then((move) => (gen === generation ? move : null))
  }

  return {
    ready,
    bestMove,
    /** Abandon any pending search (its result will resolve to null). */
    cancel() {
      generation++
      send('stop')
    },
    newGame() {
      generation++
      send('stop')
      send('ucinewgame')
      send('isready')
    },
    terminate() {
      dead = true
      generation++
      listeners.clear()
      worker.terminate()
    },
  }
}
