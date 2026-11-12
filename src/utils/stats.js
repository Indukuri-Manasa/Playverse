import { dayKey } from './daily'

// The headline "personal best" shown for each game.
export function personalBest(game, scores, activity) {
  if (game.score) return { label: game.score.label, value: scores[game.id] ?? null }
  if (game.bestStat) return game.bestStat()
  if (game.id === 'tic-tac-toe') return { label: 'CPU wins', value: activity.ttt.win || null }
  return { label: 'Best', value: null }
}

export function totalSessions(activity) {
  return Object.values(activity.sessions).reduce((sum, n) => sum + n, 0)
}

// Consecutive days played, counting back from today (or yesterday).
export function dayStreak(days) {
  const set = new Set(days)
  const cursor = new Date()
  if (!set.has(dayKey(cursor))) cursor.setDate(cursor.getDate() - 1)
  let streak = 0
  while (set.has(dayKey(cursor))) {
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}

export function playerLevel({ activity, unlocked }) {
  const xp = totalSessions(activity) * 10 + unlocked * 100 + activity.challengesDone.length * 50
  const per = 250
  return { xp, level: Math.floor(xp / per) + 1, into: xp % per, per }
}
