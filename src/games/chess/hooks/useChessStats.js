import { useCallback, useMemo } from 'react'
import { useLocalStorage } from '../../../hooks/useLocalStorage'
import { CHESS_STORAGE_KEY, EMPTY_CHESS, addMatch, summarize } from '../services/chessStatsService'

export function useChessStats() {
  const [data, setData] = useLocalStorage(CHESS_STORAGE_KEY, EMPTY_CHESS)
  const summary = useMemo(() => summarize(data), [data])
  const recordMatch = useCallback((match) => setData((d) => addMatch(d, match)), [setData])
  return { data, summary, recordMatch }
}
