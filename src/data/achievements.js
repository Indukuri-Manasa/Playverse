import { games } from './games'

const sessionsTotal = ({ activity }) =>
  Object.values(activity.sessions).reduce((sum, n) => sum + n, 0)

// Each achievement derives its progress from saved scores + activity — nothing extra stored.
export const achievements = [
  {
    id: 'first-spawn', title: 'First Spawn', description: 'Launch your first game.',
    icon: 'play', color: '#2ee6ff', goal: 1, value: sessionsTotal,
  },
  {
    id: 'explorer', title: 'Explorer', description: 'Try every game in the library.',
    icon: 'compass', color: '#b26bff', goal: games.length,
    value: ({ activity }) => games.filter((g) => activity.sessions[g.id]).length,
  },
  {
    id: 'snake-charmer', title: 'Snake Charmer', description: 'Score 10 in Snake.',
    icon: 'flame', color: '#5dff9d', goal: 10, value: ({ scores }) => scores.snake ?? 0,
  },
  {
    id: 'apex-serpent', title: 'Apex Serpent', description: 'Score 25 in Snake.',
    icon: 'crown', color: '#c6ff3d', goal: 25, value: ({ scores }) => scores.snake ?? 0,
  },
  {
    id: 'total-recall', title: 'Total Recall', description: 'Clear Memory Match in 12 moves or fewer.',
    icon: 'brain', color: '#2ee6ff', goal: 1,
    value: ({ scores }) => (scores.memory != null && scores.memory <= 12 ? 1 : 0),
  },
  {
    id: 'outsmarted', title: 'Outsmarted', description: 'Beat the CPU at Tic-Tac-Toe.',
    icon: 'chess', color: '#ff4fb8', goal: 1, value: ({ activity }) => activity.ttt.win,
  },
  {
    id: 'grandmaster', title: 'Grandmaster', description: 'Beat the CPU 10 times.',
    icon: 'trophy', color: '#ffc94d', goal: 10, value: ({ activity }) => activity.ttt.win,
  },
  {
    id: 'daily-grinder', title: 'Daily Grinder', description: 'Complete a daily challenge.',
    icon: 'target', color: '#ff7a45', goal: 1, value: ({ activity }) => activity.challengesDone.length,
  },
  {
    id: 'regular', title: 'Regular', description: 'Play on 3 different days.',
    icon: 'calendar', color: '#7c8bff', goal: 3, value: ({ activity }) => activity.days.length,
  },
]

export function evaluateAchievements(ctx) {
  return achievements.map((a) => {
    const value = Math.min(a.value(ctx), a.goal)
    return { ...a, current: value, progress: value / a.goal, unlocked: value >= a.goal }
  })
}
