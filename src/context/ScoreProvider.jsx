import { useCallback, useMemo } from 'react'
import { ScoreContext } from './scoreContext'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { useActivity } from '../hooks/useActivity'

export function ScoreProvider({ children }) {
  const [scores, setScores] = useLocalStorage('playverse:best-scores', {})
  const { recordResult } = useActivity()

  const reportScore = useCallback(
    (gameId, score, { lowerIsBetter = false } = {}) => {
      setScores((prev) => {
        const best = prev[gameId]
        const isBetter =
          best === undefined || (lowerIsBetter ? score < best : score > best)
        return isBetter ? { ...prev, [gameId]: score } : prev
      })
      // Also log the run for history, daily challenge and leaderboard (best-score logic above is unchanged).
      recordResult(gameId, score)
    },
    [setScores, recordResult],
  )

  const resetScores = useCallback(() => setScores({}), [setScores])

  const value = useMemo(
    () => ({ scores, reportScore, resetScores }),
    [scores, reportScore, resetScores],
  )

  return <ScoreContext.Provider value={value}>{children}</ScoreContext.Provider>
}
