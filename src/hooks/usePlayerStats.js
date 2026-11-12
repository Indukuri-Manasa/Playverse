import { useMemo } from 'react'
import { useActivity } from './useActivity'
import { useScores } from './useScores'
import { evaluateAchievements } from '../data/achievements'
import { dayStreak, playerLevel, totalSessions } from '../utils/stats'

// One place that derives everything the dashboards show.
export function usePlayerStats() {
  const { scores } = useScores()
  const { activity } = useActivity()
  return useMemo(() => {
    const list = evaluateAchievements({ scores, activity })
    const unlocked = list.filter((a) => a.unlocked).length
    return {
      scores,
      activity,
      achievements: list,
      unlocked,
      sessions: totalSessions(activity),
      streak: dayStreak(activity.days),
      level: playerLevel({ activity, unlocked }),
    }
  }, [scores, activity])
}
