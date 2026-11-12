import { useContext } from 'react'
import { ScoreContext } from '../context/scoreContext'

export function useScores() {
  const ctx = useContext(ScoreContext)
  if (!ctx) throw new Error('useScores must be used inside <ScoreProvider>')
  return ctx
}
