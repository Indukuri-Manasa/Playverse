import { useCallback, useEffect, useRef, useState } from 'react'
import Button from '../components/ui/Button'
import { useScores } from '../hooks/useScores'

const SIZE = 20 // cells per side
const CELL = 20 // pixels per cell
const UP = [0, -1], DOWN = [0, 1], LEFT = [-1, 0], RIGHT = [1, 0]
const KEYS = {
  ArrowUp: UP, ArrowDown: DOWN, ArrowLeft: LEFT, ArrowRight: RIGHT,
  w: UP, s: DOWN, a: LEFT, d: RIGHT,
}

const sameCell = (a, b) => a[0] === b[0] && a[1] === b[1]

function randomFood(snake) {
  const free = []
  for (let x = 0; x < SIZE; x++)
    for (let y = 0; y < SIZE; y++)
      if (!snake.some((s) => s[0] === x && s[1] === y)) free.push([x, y])
  return free.length ? free[Math.floor(Math.random() * free.length)] : null
}

function createGame() {
  const snake = [[10, 10], [9, 10], [8, 10]]
  return { snake, dir: RIGHT, queue: [], food: randomFood(snake), score: 0 }
}

function draw(canvas, g) {
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#060914'
  ctx.fillRect(0, 0, SIZE * CELL, SIZE * CELL)
  ctx.fillStyle = '#0b1122'
  for (let x = 0; x < SIZE; x++)
    for (let y = 0; y < SIZE; y++)
      if ((x + y) % 2 === 0) ctx.fillRect(x * CELL, y * CELL, CELL, CELL)

  const block = ([x, y], color, inset = 2, glow = 0) => {
    ctx.fillStyle = color
    ctx.shadowColor = color
    ctx.shadowBlur = glow
    ctx.beginPath()
    ctx.roundRect(x * CELL + inset, y * CELL + inset, CELL - inset * 2, CELL - inset * 2, 5)
    ctx.fill()
  }
  if (g.food) block(g.food, '#ff4fb8', 3, 14)
  g.snake.forEach((part, i) => block(part, i === 0 ? '#c6ff3d' : i % 2 ? '#3fe08a' : '#5dff9d', 2, i === 0 ? 12 : 0))
  ctx.shadowBlur = 0
}

const speedFor = (score) => Math.max(60, 140 - score * 4)

export default function Snake() {
  const { scores, reportScore } = useScores()
  const canvasRef = useRef(null)
  const game = useRef(null)
  if (game.current === null) game.current = createGame()

  const [status, setStatus] = useState('ready') // ready | playing | paused | over | won
  const [score, setScore] = useState(0)

  useEffect(() => draw(canvasRef.current, game.current), [])

  const start = useCallback(() => {
    game.current = createGame()
    setScore(0)
    setStatus('playing')
    draw(canvasRef.current, game.current)
  }, [])

  const turn = useCallback((d) => {
    const g = game.current
    const last = g.queue.at(-1) ?? g.dir
    const reverse = last[0] === -d[0] && last[1] === -d[1]
    if (reverse || sameCell(last, d) || g.queue.length >= 3) return
    g.queue.push(d)
  }, [])

  // Game loop
  useEffect(() => {
    if (status !== 'playing') return
    const id = setInterval(() => {
      const g = game.current
      if (g.queue.length) g.dir = g.queue.shift()
      const head = [g.snake[0][0] + g.dir[0], g.snake[0][1] + g.dir[1]]
      const ate = g.food && sameCell(head, g.food)
      const body = ate ? g.snake : g.snake.slice(0, -1)
      const hitWall = head[0] < 0 || head[1] < 0 || head[0] >= SIZE || head[1] >= SIZE

      if (hitWall || body.some((p) => sameCell(p, head))) {
        setStatus('over')
        reportScore('snake', g.score)
        return
      }
      g.snake = [head, ...body]
      if (ate) {
        g.score += 1
        g.food = randomFood(g.snake)
        setScore(g.score)
        if (!g.food) {
          setStatus('won')
          reportScore('snake', g.score)
        }
      }
      draw(canvasRef.current, g)
    }, speedFor(score))
    return () => clearInterval(id)
  }, [status, score, reportScore])

  // Keyboard controls
  useEffect(() => {
    function onKey(e) {
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key
      if (KEYS[key]) {
        e.preventDefault()
        if (status === 'ready' || status === 'over' || status === 'won') start()
        else if (status === 'playing') turn(KEYS[key])
      } else if (key === ' ') {
        e.preventDefault()
        if (status === 'playing') setStatus('paused')
        else if (status === 'paused') setStatus('playing')
        else start()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [status, start, turn])

  const overlay = {
    ready: { title: 'Ready?', text: 'Arrow keys / WASD to steer, Space to pause.', cta: 'Start' },
    paused: { title: 'Paused', text: 'Press Space to resume.', cta: 'Resume' },
    over: { title: 'Game over', text: `You scored ${score}.`, cta: 'Play again' },
    won: { title: 'Board cleared!', text: `Perfect run: ${score}.`, cta: 'Play again' },
  }[status]

  return (
    <div className="snake">
      <div className="scoreline">
        <span>Score: <strong>{score}</strong></span>
        <span>Best: <strong>{scores.snake ?? '—'}</strong></span>
      </div>

      <div className="snake-stage">
        <canvas ref={canvasRef} width={SIZE * CELL} height={SIZE * CELL} className="snake-canvas" />
        {overlay && (
          <div className={`snake-overlay overlay-${status}`}>
            <h3>{overlay.title}</h3>
            <p>{overlay.text}</p>
            <Button onClick={() => (status === 'paused' ? setStatus('playing') : start())}>
              {overlay.cta}
            </Button>
          </div>
        )}
      </div>

      <div className="dpad" aria-label="Direction controls">
        <button className="up" onClick={() => turn(UP)} aria-label="Up">▲</button>
        <button className="left" onClick={() => turn(LEFT)} aria-label="Left">◀</button>
        <button
          className="mid"
          onClick={() => setStatus((s) => (s === 'playing' ? 'paused' : s === 'paused' ? 'playing' : s))}
          aria-label="Pause"
        >
          ❚❚
        </button>
        <button className="right" onClick={() => turn(RIGHT)} aria-label="Right">▶</button>
        <button className="down" onClick={() => turn(DOWN)} aria-label="Down">▼</button>
      </div>
    </div>
  )
}
