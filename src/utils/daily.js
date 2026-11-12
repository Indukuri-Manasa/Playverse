import { games, getGame } from '../data/games'

export function dayKey(date = new Date()) {
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${m}-${d}`
}

// FNV-1a: stable "random" picks per calendar day.
function hash(str) {
  let h = 2166136261
  for (const ch of str) {
    h ^= ch.charCodeAt(0)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

export function gameOfTheDay(key = dayKey()) {
  return games[hash(`gotd:${key}`) % games.length]
}

export function dailyChallenge(key = dayKey()) {
  const h = hash(`challenge:${key}`)
  const n = (h >>> 6) % 9
  const kind = ['snake', 'memory', 'tic-tac-toe'][h % 3]
  if (kind === 'snake') {
    const target = 8 + n
    return { key, gameId: kind, target, title: `Reach ${target} points in Snake`, unit: 'pts' }
  }
  if (kind === 'memory') {
    const target = 14 + (n % 7)
    return { key, gameId: kind, target, title: `Clear Memory Match in ${target} moves or fewer`, unit: 'moves' }
  }
  const target = 1 + (n % 3)
  return {
    key, gameId: kind, target, unit: 'wins',
    title: `Beat the CPU ${target === 1 ? 'once' : `${target} times`} in Tic-Tac-Toe`,
  }
}

// `daily` = today's bests: { date, snake, memory, tttWins }
export function challengeStatus(challenge, daily) {
  const today = daily?.date === challenge.key ? daily : { snake: null, memory: null, tttWins: 0 }
  if (challenge.gameId === 'snake') {
    const best = today.snake ?? 0
    return { done: best >= challenge.target, progress: Math.min(1, best / challenge.target), label: `${best} / ${challenge.target} pts` }
  }
  if (challenge.gameId === 'memory') {
    const best = today.memory
    const done = best != null && best <= challenge.target
    return { done, progress: done ? 1 : 0, label: best == null ? 'Not cleared yet today' : `Today’s best: ${best} moves` }
  }
  const wins = today.tttWins ?? 0
  return { done: wins >= challenge.target, progress: Math.min(1, wins / challenge.target), label: `${wins} / ${challenge.target} wins` }
}

export const challengeGame = (challenge) => getGame(challenge.gameId)
